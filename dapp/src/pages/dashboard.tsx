import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Users,
  Heart,
  Repeat2,
  Trophy,
  ExternalLink,
  Sparkles,
  Target,
  BarChart3,
  Calendar,
} from "lucide-react";
import { generateMockData } from "@/lib/mock-data";
import { calculateUserWeeklyScore, getCurrentWeekNumber } from "@/lib/scoring";

export function Dashboard() {
  const mockData = generateMockData();
  const currentWeek = getCurrentWeekNumber();

  const { userScores, totalMetrics, chartData } = useMemo(() => {
    const scores = mockData.map((user) =>
      calculateUserWeeklyScore(user, currentWeek)
    );
    const sortedScores = scores.sort((a, b) => b.weeklyScore - a.weeklyScore);

    const totalTweets = scores.reduce(
      (sum, score) => sum + score.totalTweets,
      0
    );
    const totalLikes = mockData.reduce(
      (sum, user) =>
        sum + user.tweets.reduce((userSum, tweet) => userSum + tweet.likes, 0),
      0
    );
    const totalRetweets = mockData.reduce(
      (sum, user) =>
        sum +
        user.tweets.reduce((userSum, tweet) => userSum + tweet.retweets, 0),
      0
    );
    const totalUsers = mockData.length;

    const barData = sortedScores.slice(0, 6).map((score) => ({
      name: score.user.displayName,
      score: Math.round(score.weeklyScore),
      tweets: score.totalTweets,
    }));

    const pieData = [
      { name: "Likes", value: totalLikes, color: "#3B82F6" },
      { name: "Retweets", value: totalRetweets * 2, color: "#8B5CF6" },
    ];

    const weeklyTrend = Array.from({ length: 7 }, (_, i) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
      engagement: Math.floor(Math.random() * 1000) + 500,
      score: Math.floor(Math.random() * 500) + 200,
    }));

    return {
      userScores: sortedScores,
      totalMetrics: { totalTweets, totalLikes, totalRetweets, totalUsers },
      chartData: { barData, pieData, weeklyTrend },
    };
  }, [mockData, currentWeek]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Engagement Dashboard
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Track community Twitter engagement with our advanced scoring system.
          Monitor impact, freshness, and consistency across your community.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Week {currentWeek}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300"
            asChild
          >
            <a
              href="https://t.me/OpenServ_Leaderboard_bot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Leaderboard
            </a>
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900 dark:to-blue-800 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalMetrics.totalUsers}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Active this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900 dark:to-purple-800 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Total Tweets
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {totalMetrics.totalTweets}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              This week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 dark:from-pink-900 dark:to-pink-800 dark:border-pink-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-800 dark:text-pink-200">
              Total Likes
            </CardTitle>
            <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900 dark:text-pink-100">
              {totalMetrics.totalLikes.toLocaleString()}
            </div>
            <p className="text-xs text-pink-700 dark:text-pink-300">
              Across all tweets
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-900 dark:to-green-800 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              Total Retweets
            </CardTitle>
            <Repeat2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {totalMetrics.totalRetweets.toLocaleString()}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              Amplified reach
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tick={{ fill: "currentColor" }}
                />
                <YAxis fontSize={12} tick={{ fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="score"
                  fill="url(#gradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Weekly Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  fontSize={12}
                  tick={{ fill: "currentColor" }}
                />
                <YAxis fontSize={12} tick={{ fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#8B5CF6"
                  fill="url(#areaGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Users Preview */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span>Community Leaders</span>
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <a href="/leaderboard">
                View All
                <TrendingUp className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userScores.slice(0, 3).map((userScore, index) => (
              <div
                key={userScore.user.id}
                className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : "bg-amber-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <Avatar>
                    <AvatarImage
                      src={userScore.user.avatar}
                      alt={userScore.user.displayName}
                    />
                    <AvatarFallback>
                      {userScore.user.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {userScore.user.displayName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {userScore.user.username}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(userScore.weeklyScore).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userScore.totalTweets} tweets
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Telegram Bot CTA */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <ExternalLink className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold">Get Real-Time Updates</h3>
            <p className="text-purple-100 max-w-2xl mx-auto">
              Join our Telegram bot to receive live leaderboard updates, score
              notifications, and engage with the community directly.
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
              asChild
            >
              <a
                href="https://t.me/OpenServ_Leaderboard_bot"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Join Telegram Bot
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
