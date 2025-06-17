export interface TweetData {
  id: string;
  content: string;
  likes: number;
  retweets: number;
  timestamp: Date;
  weekNumber: number;
  orderInWeek: number;
}

export interface UserData {
  id: string;
  username: string;
  displayName: string;
  followers: number;
  avatar: string;
  tweets: TweetData[];
  lastWeekActive: boolean;
}

export interface ScoredTweet extends TweetData {
  impactScore: number;
  freshnessMultiplier: number;
  consistencyMultiplier: number;
  decayFactor: number;
  finalScore: number;
}

export interface UserScore {
  user: UserData;
  weeklyScore: number;
  scoredTweets: ScoredTweet[];
  totalTweets: number;
  avgScore: number;
}

export function calculateImpactScore(followers: number, likes: number, retweets: number): number {
  return (followers * 0.001) + likes + (retweets * 2);
}

export function getFreshnessMultiplier(tweetOrder: number): number {
  if (tweetOrder === 1) return 3;
  if (tweetOrder === 2) return 2;
  return 1;
}

export function getConsistencyMultiplier(userPostedLastWeek: boolean): number {
  return userPostedLastWeek ? 1.25 : 1;
}

export function getDecayFactor(weekOrder: number): number {
  if (weekOrder === 1) return 1;
  if (weekOrder === 2) return 0.5;
  return 0.25;
}

export function scoreTweet(
  tweet: TweetData,
  user: UserData,
  tweetOrderInWeek: number
): ScoredTweet {
  const impactScore = calculateImpactScore(user.followers, tweet.likes, tweet.retweets);
  const freshnessMultiplier = getFreshnessMultiplier(tweet.orderInWeek);
  const consistencyMultiplier = getConsistencyMultiplier(user.lastWeekActive);
  const decayFactor = getDecayFactor(tweetOrderInWeek);

  const finalScore = impactScore * freshnessMultiplier * consistencyMultiplier * decayFactor;

  return {
    ...tweet,
    impactScore,
    freshnessMultiplier,
    consistencyMultiplier,
    decayFactor,
    finalScore,
  };
}

export function calculateUserWeeklyScore(user: UserData, weekNumber: number): UserScore {
  const weekTweets = user.tweets.filter(tweet => tweet.weekNumber === weekNumber);
  
  // Sort tweets by timestamp to determine order in week
  const sortedTweets = [...weekTweets].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  const scoredTweets = sortedTweets.map((tweet, index) => 
    scoreTweet(tweet, user, index + 1)
  );

  const weeklyScore = scoredTweets.reduce((sum, tweet) => sum + tweet.finalScore, 0);
  const avgScore = scoredTweets.length > 0 ? weeklyScore / scoredTweets.length : 0;

  return {
    user,
    weeklyScore,
    scoredTweets,
    totalTweets: scoredTweets.length,
    avgScore,
  };
}

export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

export function getCurrentWeekNumber(): number {
  return getWeekNumber(new Date());
}