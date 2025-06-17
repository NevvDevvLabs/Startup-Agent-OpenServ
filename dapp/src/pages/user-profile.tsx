import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowLeft,
  Twitter,
  Users,
  Heart,
  Repeat2,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Zap,
  Clock,
  Star,
  Activity
} from 'lucide-react';
import { generateMockData } from '@/lib/mock-data';
import { calculateUserWeeklyScore, getCurrentWeekNumber } from '@/lib/scoring';

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const mockData = generateMockData();
  const currentWeek = getCurrentWeekNumber();
  
  const userProfile = useMemo(() => {
    const user = mockData.find(u => u.id === userId);
    if (!user) return null;

    const weeklyScore = calculateUserWeeklyScore(user, currentWeek);
    const allUsers = mockData.map(u => calculateUserWeeklyScore(u, currentWeek));
    const sortedUsers = allUsers.sort((a, b) => b.weeklyScore - a.weeklyScore);
    const userRank = sortedUsers.findIndex(u => u.user.id === userId) + 1;

    // Generate historical data for the past 4 weeks
    const historicalData = Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${currentWeek - 3 + i}`,
      score: Math.floor(weeklyScore.weeklyScore * (0.7 + Math.random() * 0.6)),
      tweets: Math.floor(Math.random() * 5) + 1,
      engagement: Math.floor(Math.random() * 1000) + 200,
    }));

    // Tweet performance data
    const tweetData = weeklyScore.scoredTweets.map((tweet, index) => ({
      tweetId: index + 1,
      content: tweet.content.substring(0, 30) + '...',
      score: Math.round(tweet.finalScore),
      likes: tweet.likes,
      retweets: tweet.retweets,
      impact: Math.round(tweet.impactScore),
      multipliers: tweet.freshnessMultiplier * tweet.consistencyMultiplier * tweet.decayFactor,
    }));

    // Scoring breakdown
    const scoringBreakdown = [
      { name: 'Impact Score', value: Math.round(weeklyScore.scoredTweets.reduce((sum, tweet) => sum + tweet.impactScore, 0)), color: '#3B82F6' },
      { name: 'Freshness Bonus', value: Math.round(weeklyScore.scoredTweets.reduce((sum, tweet) => sum + tweet.impactScore * (tweet.freshnessMultiplier - 1), 0)), color: '#10B981' },
      { name: 'Consistency Bonus', value: Math.round(weeklyScore.scoredTweets.reduce((sum, tweet) => sum + tweet.impactScore * tweet.freshnessMultiplier * (tweet.consistencyMultiplier - 1), 0)), color: '#8B5CF6' },
    ];

    return {
      user,
      weeklyScore,
      userRank,
      historicalData,
      tweetData,
      scoringBreakdown,
    };
  }, [userId, mockData, currentWeek]);

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">The user you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/leaderboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Link>
        </Button>
      </div>
    );
  }

  const { user, weeklyScore, userRank, historicalData, tweetData, scoringBreakdown } = userProfile;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link to="/leaderboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leaderboard
          </Link>
        </Button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Profile</h1>
      </div>

      {/* User Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 dark:from-purple-900 dark:to-blue-900 dark:border-purple-700">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-2xl">{user.displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user.displayName}</h2>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  Rank #{userRank}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <Twitter className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-300">{user.username}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {user.followers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(weeklyScore.weeklyScore).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Weekly Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {weeklyScore.totalTweets}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tweets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.round(weeklyScore.avgScore)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span>Performance Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="week" 
                  fontSize={12}
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis fontSize={12} tick={{ fill: 'currentColor' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span>Score Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={scoringBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {scoringBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tweet Performance */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span>Tweet Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tweetData.map((tweet, index) => (
              <div key={tweet.tweetId} className="p-4 rounded-lg border bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary">Tweet #{tweet.tweetId}</Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {weeklyScore.scoredTweets[index].timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 mb-3">{tweet.content}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-pink-600 dark:text-pink-400">
                        <Heart className="w-4 h-4" />
                        <span>{tweet.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <Repeat2 className="w-4 h-4" />
                        <span>{tweet.retweets}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                        <Activity className="w-4 h-4" />
                        <span>Impact: {tweet.impact}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {tweet.score}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Final Score</p>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {tweet.multipliers.toFixed(2)}x multiplier
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Details */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>Scoring Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Impact Score</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Based on followers (×0.001) + likes + retweets (×2)
              </p>
            </div>

            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Freshness</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                First tweet: 3x, Second: 2x, Others: 1x
              </p>
            </div>

            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Consistency</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {user.lastWeekActive ? '1.25x bonus for posting last week' : 'No bonus - didn\'t post last week'}
              </p>
            </div>

            <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Decay Factor</h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                1st tweet: 1x, 2nd: 0.5x, 3rd+: 0.25x
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}