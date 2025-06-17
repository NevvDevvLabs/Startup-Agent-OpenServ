import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  Users,
  Clock,
  Zap,
  Star,
  ChevronRight,
  Crown,
  Target,
  Sparkles
} from 'lucide-react';
import { generateMockData } from '@/lib/mock-data';
import { calculateUserWeeklyScore, getCurrentWeekNumber } from '@/lib/scoring';

export function Leaderboard() {
  const mockData = generateMockData();
  const currentWeek = getCurrentWeekNumber();
  const [selectedTab, setSelectedTab] = useState('current');

  const { currentWeekScores, allTimeScores } = useMemo(() => {
    const current = mockData.map(user => calculateUserWeeklyScore(user, currentWeek))
      .sort((a, b) => b.weeklyScore - a.weeklyScore);
    
    // Simulate all-time scores with random multipliers
    const allTime = mockData.map(user => ({
      ...calculateUserWeeklyScore(user, currentWeek),
      weeklyScore: calculateUserWeeklyScore(user, currentWeek).weeklyScore * (Math.random() * 3 + 1)
    })).sort((a, b) => b.weeklyScore - a.weeklyScore);

    return {
      currentWeekScores: current,
      allTimeScores: allTime,
    };
  }, [mockData, currentWeek]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold dark:bg-purple-900 dark:text-purple-300">{rank}</div>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white">Champion</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-white">Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 text-white">Third Place</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return null;
  };

  const ScoreBreakdown = ({ userScore, rank }: { userScore: any, rank: number }) => (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {getRankIcon(rank)}
            <Avatar className="w-12 h-12">
              <AvatarImage src={userScore.user.avatar} alt={userScore.user.displayName} />
              <AvatarFallback>{userScore.user.displayName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">{userScore.user.displayName}</h3>
              {getRankBadge(rank)}
            </div>
            <p className="text-gray-600 dark:text-gray-300">{userScore.user.username}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{userScore.user.followers.toLocaleString()} followers</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Target className="w-4 h-4" />
                <span>{userScore.totalTweets} tweets</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(userScore.weeklyScore).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Score</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {Math.round(userScore.avgScore)} avg
              </span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/user/${userScore.user.id}`}>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        
        {/* Score Breakdown */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Impact</div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(userScore.scoredTweets.reduce((sum: number, tweet: any) => sum + tweet.impactScore, 0))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Freshness</div>
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                {userScore.scoredTweets.reduce((sum: number, tweet: any) => sum + tweet.freshnessMultiplier, 0)}x
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Consistency</div>
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {userScore.user.lastWeekActive ? '1.25x' : '1.0x'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Decay</div>
              <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {userScore.scoredTweets.reduce((sum: number, tweet: any) => sum + tweet.decayFactor, 0).toFixed(2)}x
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Community Leaderboard
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover the most engaged community members based on our comprehensive scoring system. 
          Rankings update in real-time based on Twitter engagement metrics.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 dark:from-yellow-900 dark:to-orange-800 dark:border-yellow-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Current Champion
            </CardTitle>
            <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {currentWeekScores[0]?.user.displayName}
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              {Math.round(currentWeekScores[0]?.weeklyScore).toLocaleString()} points
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-blue-100 border-purple-200 dark:from-purple-900 dark:to-blue-800 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Active Users
            </CardTitle>
            <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {currentWeekScores.length}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              This week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-100 border-green-200 dark:from-green-900 dark:to-teal-800 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              Week {currentWeek}
            </CardTitle>
            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              2025
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              Current period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>This Week</span>
          </TabsTrigger>
          <TabsTrigger value="alltime" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>All Time</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="text-center py-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Week {currentWeek} Rankings
            </Badge>
          </div>
          {currentWeekScores.map((userScore, index) => (
            <ScoreBreakdown key={userScore.user.id} userScore={userScore} rank={index + 1} />
          ))}
        </TabsContent>

        <TabsContent value="alltime" className="space-y-4">
          <div className="text-center py-4">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
              All-Time Champions
            </Badge>
          </div>
          {allTimeScores.map((userScore, index) => (
            <ScoreBreakdown key={userScore.user.id} userScore={userScore} rank={index + 1} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}