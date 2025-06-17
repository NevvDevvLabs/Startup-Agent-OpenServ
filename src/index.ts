import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { Agent } from "@openserv-labs/sdk";
import axios from "axios";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

dotenv.config();

interface CacheData {
  allTweets: any[];
  allUsers: any[];
  leaderboard: any[];
  lastUpdated: number;
  lastFullRefresh: number;
  newestId: string | null;
  targetHandle: string;
  totalTweets: number;
}

class SimpleTelegramBot extends Agent {
  private bot: TelegramBot;
  private workspaceId: number;
  private agentId: number;
  private cache: CacheData | null = null;
  private cacheFile: string = "leaderboard_cache.json";
  private cacheTTL: number = 1000 * 60 * 60 * 6;
  private fullRefreshInterval: number = 1000 * 60 * 60 * 24;
  private incrementalCheckInterval: number = 1000 * 60 * 2;
  private isUpdating: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    const requiredVars = [
      "TELEGRAM_BOT_TOKEN",
      "OPENSERV_API_KEY",
      "WORKSPACE_ID",
      "AGENT_ID",
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error("❌ Missing required environment variables:", missingVars);
      process.exit(1);
    }

    super({
      systemPrompt: "You are a helpful assistant.",
      apiKey: process.env.OPENSERV_API_KEY!,
    });

    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
      polling: true,
    });
    this.workspaceId = parseInt(process.env.WORKSPACE_ID!);
    this.agentId = parseInt(process.env.AGENT_ID!);

    this.addDebugCapability();

    this.setupHandlers();
    this.loadCacheFromFile();
    this.setupAutoRefresh();
  }

  private async loadCacheFromFile(): Promise<void> {
    try {
      const data = await fs.readFile(this.cacheFile, "utf-8");
      this.cache = JSON.parse(data);
      console.log(
        `📂 Cache loaded from file. Last updated: ${new Date(
          this.cache!.lastUpdated
        ).toLocaleString()}`
      );
      console.log(
        `📊 Cached data: ${this.cache!.totalTweets} tweets, ${
          this.cache!.leaderboard.length
        } users`
      );
    } catch (error) {
      console.log("📂 No cache file found, will create on first update");
    }
  }

  private async saveCacheToFile(): Promise<void> {
    if (this.cache) {
      try {
        await fs.writeFile(this.cacheFile, JSON.stringify(this.cache, null, 2));
        console.log("💾 Cache saved to file");
      } catch (error) {
        console.error("❌ Error saving cache to file:", error);
      }
    }
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    const now = Date.now();
    const age = now - this.cache.lastUpdated;
    return age < this.cacheTTL;
  }

  private needsFullRefresh(): boolean {
    if (!this.cache) return true;
    const now = Date.now();
    const age = now - this.cache.lastFullRefresh;
    return age > this.fullRefreshInterval;
  }

  private setupAutoRefresh(): void {
    this.updateInterval = setInterval(async () => {
      if (this.needsFullRefresh()) {
        console.log("🔄 Performing daily full refresh...");
        await this.refreshLeaderboardData("openservai", false, true);
      } else {
        console.log("🔄 Checking for new mentions...");
        await this.incrementalUpdate("openservai", true);
      }
    }, this.incrementalCheckInterval);
  }

  private async incrementalUpdate(
    targetHandle: string,
    silent: boolean = false
  ): Promise<void> {
    if (this.isUpdating || !this.cache) {
      if (!silent) console.log("⏳ Update already in progress or no cache...");
      return;
    }

    this.isUpdating = true;

    try {
      if (!silent) console.log("🔄 Checking for new mentions...");

      const newData = await this.getNewMentions(
        targetHandle,
        this.cache.newestId
      );

      if (newData.allTweets.length > 0) {
        this.cache.allTweets.unshift(...newData.allTweets);

        const existingUserIds = new Set(this.cache.allUsers.map((u) => u.id));
        const newUsers = newData.allUsers.filter(
          (u) => !existingUserIds.has(u.id)
        );
        this.cache.allUsers.push(...newUsers);

        this.cache.newestId = newData.allTweets[0]?.id || this.cache.newestId;
        this.cache.totalTweets = this.cache.allTweets.length;
        this.cache.lastUpdated = Date.now();

        this.cache.leaderboard = this.createMentionsLeaderboard(
          this.cache.allTweets,
          this.cache.allUsers
        );

        await this.saveCacheToFile();

        if (!silent) {
          console.log(
            `✅ Added ${newData.allTweets.length} new tweets! Total: ${this.cache.totalTweets}`
          );
        }
      } else {
        if (!silent) {
          console.log("✅ No new mentions found");
        }
        this.cache.lastUpdated = Date.now();
      }
    } catch (error) {
      console.error("❌ Error in incremental update:", error);
    } finally {
      this.isUpdating = false;
    }
  }

  private async getNewMentions(handle: string, sinceId: string | null = null) {
    let allTweets = [];
    let allUsers = [];
    let nextToken = null;
    let pageCount = 0;

    do {
      pageCount++;
      console.log(`Fetching new mentions page ${pageCount}...`);

      const params: any = {
        query: `@${handle}`,
        max_results: 100,
        "tweet.fields":
          "created_at,author_id,public_metrics,context_annotations",
        "user.fields": "username,name,verified",
        expansions: "author_id",
      };

      if (sinceId) {
        params.since_id = sinceId;
      }

      if (nextToken) {
        params.next_token = nextToken;
      }

      const response = await this.callIntegration({
        workspaceId: this.workspaceId,
        integrationId: "twitter-v2",
        details: {
          endpoint: "/2/tweets/search/recent",
          method: "GET",
          params: params,
        },
      });

      if (response.output && response.output.data) {
        allTweets.push(...response.output.data);
        console.log(
          `New mentions page ${pageCount}: Found ${response.output.data.length} tweets`
        );

        if (response.output.includes && response.output.includes.users) {
          allUsers.push(...response.output.includes.users);
        }
      }

      nextToken = response.output?.meta?.next_token;

      if (nextToken) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } while (nextToken);

    console.log(
      `\n🎉 New mentions fetch complete! Found ${allTweets.length} new tweets`
    );

    return { allTweets, allUsers };
  }

  public refreshLeaderboardData = async (
    targetHandle: string,
    silent: boolean = false,
    forceFullRefresh: boolean = false
  ): Promise<CacheData> => {
    if (this.isUpdating) {
      if (!silent) console.log("⏳ Update already in progress...");
      if (this.cache) return this.cache;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return this.cache || this.createEmptyCache(targetHandle);
    }

    if (this.cache && !forceFullRefresh && !this.needsFullRefresh()) {
      await this.incrementalUpdate(targetHandle, silent);
      return this.cache;
    }

    this.isUpdating = true;

    try {
      if (!silent)
        console.log("🔄 Performing full refresh of leaderboard data...");

      const { allTweets, allUsers } = await this.getAllMentions(targetHandle);
      const leaderboard = this.createMentionsLeaderboard(allTweets, allUsers);

      this.cache = {
        allTweets,
        allUsers,
        leaderboard,
        lastUpdated: Date.now(),
        lastFullRefresh: Date.now(),
        newestId: allTweets.length > 0 ? allTweets[0].id : null,
        targetHandle,
        totalTweets: allTweets.length,
      };

      await this.saveCacheToFile();

      if (!silent) {
        console.log(
          `✅ Full refresh complete! Found ${allTweets.length} tweets from ${leaderboard.length} users`
        );
      }

      return this.cache;
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
      return this.cache || this.createEmptyCache(targetHandle);
    } finally {
      this.isUpdating = false;
    }
  };

  private createEmptyCache(targetHandle: string): CacheData {
    return {
      allTweets: [],
      allUsers: [],
      leaderboard: [],
      lastUpdated: 0,
      lastFullRefresh: 0,
      newestId: null,
      targetHandle,
      totalTweets: 0,
    };
  }

  private async getCachedData(targetHandle: string): Promise<CacheData> {
    if (this.isCacheValid() && this.cache?.targetHandle === targetHandle) {
      if (!this.isUpdating) {
        this.incrementalUpdate(targetHandle, true);
      }
      return this.cache;
    }

    return await this.refreshLeaderboardData(targetHandle);
  }

  public getAllMentions = async (handle: string) => {
    let allTweets = [];
    let allUsers = [];
    let nextToken = null;
    let pageCount = 0;

    do {
      pageCount++;
      console.log(`Fetching page ${pageCount}...`);

      const params = {
        query: `@${handle}`,
        max_results: 100,
        "tweet.fields":
          "created_at,author_id,public_metrics,context_annotations",
        "user.fields": "username,name,verified",
        expansions: "author_id",
      };

      if (nextToken) {
        params.next_token = nextToken;
      }

      const response = await this.callIntegration({
        workspaceId: this.workspaceId,
        integrationId: "twitter-v2",
        details: {
          endpoint: "/2/tweets/search/recent",
          method: "GET",
          params: params,
        },
      });

      if (response.output && response.output.data) {
        allTweets.push(...response.output.data);
        console.log(
          `Page ${pageCount}: Found ${response.output.data.length} tweets`
        );

        if (response.output.includes && response.output.includes.users) {
          allUsers.push(...response.output.includes.users);
        }
      }

      nextToken = response.output?.meta?.next_token;

      if (nextToken) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } while (nextToken);

    console.log(`\n🎉 Pagination complete!`);
    console.log(`📊 Total tweets found: ${allTweets.length}`);
    console.log(`📄 Total pages fetched: ${pageCount}`);

    return { allTweets, allUsers };
  };

  public createMentionsLeaderboard(allTweets: any[], allUsers: any[]) {
    const mentionCounts = {};

    allTweets.forEach((tweet) => {
      const authorId = tweet.author_id;
      const user = allUsers.find((u) => u.id === authorId);

      if (user) {
        const username = user.username;
        const displayName = user.name;
        const userKey = `@${username}`;

        if (!mentionCounts[userKey]) {
          mentionCounts[userKey] = {
            count: 0,
            username: username,
            displayName: displayName,
            verified: user.verified || false,
          };
        }
        mentionCounts[userKey].count++;
      }
    });

    const leaderboard = Object.entries(mentionCounts)
      .map(([userKey, data]: [string, any]) => ({
        username: userKey,
        displayName: data.displayName,
        count: data.count,
        verified: data.verified,
      }))
      .sort((a, b) => b.count - a.count);

    return leaderboard;
  }

  public findUserStats(
    leaderboard: any[],
    searchHandle: string,
    totalTweets: number
  ) {
    const cleanHandle = searchHandle.replace("@", "").toLowerCase();

    const userIndex = leaderboard.findIndex(
      (user) =>
        user.username.toLowerCase() === `@${cleanHandle}` ||
        user.username.toLowerCase().replace("@", "") === cleanHandle
    );

    if (userIndex === -1) {
      return {
        found: false,
        message: `❌ User "${searchHandle}" not found in the leaderboard.\nThey haven't mentioned this handle in the analyzed period.`,
      };
    }

    const user = leaderboard[userIndex];
    const rank = userIndex + 1;
    const verifiedBadge = user.verified ? " ✓" : "";

    const percentage = ((user.count / totalTweets) * 100).toFixed(1);
    const isTopTen = rank <= 10;
    const isTopHalf = rank <= Math.ceil(leaderboard.length / 2);

    let performance = "";
    if (rank === 1) performance = "👑 CHAMPION!";
    else if (rank <= 3) performance = "🥉 TOP 3!";
    else if (rank <= 10) performance = "🏆 TOP 10!";
    else if (isTopHalf) performance = "📈 Top Half";
    else performance = "📊 Lower Half";

    const statsText = [
      `👤 USER STATS FOR ${user.username}${verifiedBadge}`,
      "═".repeat(40),
      `📍 Rank: #${rank} out of ${leaderboard.length} users`,
      `💬 Mentions: ${user.count}`,
      `📊 Percentage of total: ${percentage}%`,
      `🎯 Performance: ${performance}`,
      "",
      `📝 Display Name: ${user.displayName}`,
      `✅ Verified: ${user.verified ? "Yes" : "No"}`,
      "",
      isTopTen
        ? "🎉 Congratulations! You're in the top 10!"
        : isTopHalf
        ? "👍 You're doing great!"
        : "💪 Keep mentioning to climb the ranks!",
    ].join("\n");

    return {
      found: true,
      user: user,
      rank: rank,
      statsText: statsText,
    };
  }

  public formatFullLeaderboard(
    leaderboard: any[],
    totalTweets: number,
    lastUpdated: number
  ) {
    const top10 = leaderboard.slice(0, 10);
    const cacheAge = Math.floor((Date.now() - lastUpdated) / (1000 * 60));

    const top10Text = [
      "🏆 TOP 10 MOST ACTIVE MENTIONERS 🏆",
      "═".repeat(45),
      ...top10.map((user, index) => {
        const rank = `#${(index + 1).toString().padStart(2, "0")}`;
        const verifiedBadge = user.verified ? " ✓" : "";
        const count = user.count.toString().padStart(3, " ");
        return `${rank} | ${count} mentions | ${user.username}${verifiedBadge}`;
      }),
      "",
      `📊 Total unique users: ${leaderboard.length}`,
      `📈 Total mentions analyzed: ${totalTweets}`,
      `⏰ Last updated: ${cacheAge} minutes ago`,
    ].join("\n");

    return top10Text;
  }

  public handleLeaderboardCommand = async (
    command: string,
    targetHandle: string
  ) => {
    const cachedData = await this.getCachedData(targetHandle);

    const commandParts = command.trim().split(" ");
    const isPersonalRequest = commandParts.length > 1;

    if (isPersonalRequest) {
      const requestedHandle = commandParts[1];
      const userStats = this.findUserStats(
        cachedData.leaderboard,
        requestedHandle,
        cachedData.totalTweets
      );

      if (userStats.found) {
        return {
          type: "personal",
          text: userStats.statsText,
          userFound: true,
          rank: userStats.rank,
          user: userStats.user,
        };
      } else {
        return {
          type: "personal",
          text: userStats.message,
          userFound: false,
        };
      }
    } else {
      const top10Text = this.formatFullLeaderboard(
        cachedData.leaderboard,
        cachedData.totalTweets,
        cachedData.lastUpdated
      );
      return {
        type: "full",
        text: top10Text,
        fullLeaderboard: cachedData.leaderboard,
        totalTweets: cachedData.totalTweets,
      };
    }
  };

  private addDebugCapability() {
    this.addCapability({
      name: "debugAgents",
      description: "Debug: log all available agents",
      schema: z.object({}),
      async run({ args, action }) {
        if (!action?.workspace?.agents) {
          console.log("❌ No workspace agents available");
          return "No workspace context available";
        }

        console.log("🔍 Available Agents in Workspace:");
        action.workspace.agents.forEach((agent, index) => {
          console.log(`${index + 1}. Name: "${agent.name}" | ID: ${agent.id}`);
          console.log(`   Capabilities: ${agent.capabilities_description}`);
          console.log("---");
        });

        return `Found ${action.workspace.agents.length} agents. Check console for details.`;
      },
    });
  }

  private setupHandlers() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(
        chatId,
        "🤖 Simple OpenServ Bot!\n\nUsage: /ask [your question]\nExample: /ask What is OpenServ?\n\nLeaderboard: /leaderboard or /leaderboard @username"
      );
    });

    this.bot.onText(/\/ask (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const question = match?.[1];

      if (!question) {
        await this.bot.sendMessage(
          chatId,
          "❌ Please write a question: /ask [your question]"
        );
        return;
      }

      this.bot.sendChatAction(chatId, "typing");

      try {
        console.log(`📝 Question received: "${question}"`);

        const task = await this.createTask({
          workspaceId: this.workspaceId,
          assignee: this.agentId,
          description: "Answer user question",
          body: `User asked: "${question}"\n\nPlease provide a helpful and accurate answer.`,
          input: question,
          expectedOutput: "A clear and helpful answer to the user question",
          dependencies: [],
        });

        console.log(`🚀 Task created with ID: ${task.id}`);

        const result = await this.waitForTaskCompletion(task.id, chatId);

        if (result) {
          await this.bot.sendMessage(chatId, result);
        } else {
          await this.bot.sendMessage(
            chatId,
            "❌ Sorry, I could not answer your question. Please try again."
          );
        }
      } catch (error) {
        console.error("Error processing question:", error);
        await this.bot.sendMessage(
          chatId,
          "❌ An error occurred. Please try again."
        );
      }
    });

    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      const helpText = `
📖 Help:

Commands:
• /start - Start the bot
• /ask [question] - Ask a question
• /leaderboard - Show top 10 mentioners (cached, instant)
• /leaderboard @username - Show personal stats
• /help - Show this help message

Examples:
/ask Give information about OpenServ platform
/leaderboard
/leaderboard @alice_doe

ℹ️ The bot uses smart caching:
• Instant responses from 6-hour cache
• Auto-updates every 30 minutes (new tweets only)
• Full refresh every 24 hours
      `;
      await this.bot.sendMessage(chatId, helpText);
    });

    this.bot.onText(/\/leaderboard(.*)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const command = match?.[0] || "/leaderboard";

      try {
        console.log(`📊 Leaderboard command: "${command}" (using smart cache)`);

        const result = await this.handleLeaderboardCommand(
          command,
          "openservai"
        );

        const maxLength = 4096;
        const message = result.text;

        if (message.length <= maxLength) {
          await this.bot.sendMessage(chatId, message);
        } else {
          const chunks = message.match(/.{1,4000}/g) || [message];
          for (const chunk of chunks) {
            await this.bot.sendMessage(chatId, chunk);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (result.type === "personal") {
          console.log(
            `👤 Personal stats ${
              result.userFound ? "found" : "not found"
            } (instant from cache)`
          );
        } else {
          console.log(`🏆 Full leaderboard sent (instant from cache)`);
        }
      } catch (error) {
        console.error("Error processing leaderboard:", error);
        await this.bot.sendMessage(
          chatId,
          "❌ An error occurred while fetching the leaderboard. Please try again."
        );
      }
    });

    this.bot.on("polling_error", (error) => {
      console.error("Telegram polling error:", error);
    });

    console.log("✅ Telegram bot handlers set up successfully!");
  }

  private async waitForTaskCompletion(
    taskId: number,
    chatId: number
  ): Promise<string | null> {
    const maxWaitTime = 480000;
    const pollInterval = 5000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        this.bot.sendChatAction(chatId, "typing");

        const taskDetail = await this.getTaskDetail({
          taskId: taskId,
          workspaceId: this.workspaceId,
        });

        console.log(`⏳ Task ${taskId} status: ${taskDetail?.status}`);

        if (taskDetail?.status === "done") {
          console.log(`✅ Task completed!`);

          if (taskDetail.attachments && taskDetail.attachments.length > 0) {
            try {
              const files = await this.getFiles({
                workspaceId: this.workspaceId,
              });
              const resultFile = files.find((file: any) =>
                taskDetail.attachments?.some((att: any) =>
                  file.path?.includes(att.path)
                )
              );

              if (resultFile) {
                const fileContent = await axios.get(resultFile.fullUrl);

                await this.deleteFile({
                  workspaceId: this.workspaceId,
                  fileId: resultFile.id,
                }).catch(() => {});

                return (
                  fileContent.data ||
                  "Task completed but could not retrieve result."
                );
              }
            } catch (fileError) {
              console.error("Error reading result file:", fileError);
            }
          }

          if (taskDetail.output) {
            return taskDetail.output;
          }

          return "Task completed.";
        }

        if (taskDetail?.status === "error") {
          console.error(`❌ Task failed`);
          return null;
        }

        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (pollError) {
        console.error("Error during polling:", pollError);
      }
    }

    console.log(`⏰ Task ${taskId} timeout`);
    return "Timeout. The task might still be processing.";
  }

  public async start(): Promise<void> {
    try {
      console.log("🚀 Starting Simple OpenServ Telegram Bot...");

      await super.start();

      console.log("✅ Bot is running! Send /start to begin.");

      process.on("SIGINT", () => {
        console.log("\n⏹️ Shutting down bot...");
        if (this.updateInterval) {
          clearInterval(this.updateInterval);
        }
        this.bot.stopPolling();
        process.exit(0);
      });
    } catch (error) {
      console.error("❌ Error starting bot:", error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const bot = new SimpleTelegramBot();
  bot.start();
}

export default SimpleTelegramBot;
