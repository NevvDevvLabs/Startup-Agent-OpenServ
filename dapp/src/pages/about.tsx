import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Users,
  TrendingUp,
  Zap,
  Target,
  Clock,
  Star,
  Calendar,
  ExternalLink,
  Award,
  BarChart3,
  Sparkles,
} from "lucide-react";

export function About() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            How It Works
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Our scoring system evaluates community engagement using algorithm that
          considers impact, timing, consistency, and decay factors to create
          fair and meaningful rankings.
        </p>
      </div>

      {/* Main Formula */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 dark:from-purple-900 dark:to-blue-900 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span className="text-2xl">Scoring Formula</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 border">
              <code className="text-xl font-mono text-purple-600 dark:text-purple-400">
                Final Score = ImpactScore × FreshnessMultiplier ×
                ConsistencyMultiplier × DecayFactor
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span>Impact Score</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <code className="text-blue-700 dark:text-blue-300 font-mono">
                (followers × 0.001) + likes + (retweets × 2)
              </code>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Followers:</strong> Account reach potential (weighted at
                0.1%)
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Likes:</strong> Direct engagement, counted 1:1
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Retweets:</strong> Amplification value, counted 2:1
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-green-500" />
              <span>Freshness Multiplier</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <span className="text-sm">First tweet of the day</span>
                <Badge className="bg-green-500">3x</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <span className="text-sm">Second tweet of the day</span>
                <Badge className="bg-green-500">2x</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <span className="text-sm">Third+ tweets of the day</span>
                <Badge className="bg-green-500">1x</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Rewards early and limited posting to encourage quality over
              quantity.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span>Consistency Multiplier</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <span className="text-sm">Posted last week</span>
                <Badge className="bg-purple-500">1.25x</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">Didn't post last week</span>
                <Badge variant="secondary">1.0x</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Rewards consistent weekly participation in the community.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span>Decay Factor</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                <span className="text-sm">First tweet this week</span>
                <Badge className="bg-orange-500">1.0x</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                <span className="text-sm">Second tweet this week</span>
                <Badge className="bg-orange-500">0.5x</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                <span className="text-sm">Third+ tweets this week</span>
                <Badge className="bg-orange-500">0.25x</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Prevents spam and encourages thoughtful, spaced-out posting.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Example Calculation */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900 dark:to-orange-900 dark:border-yellow-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-yellow-600" />
            <span>Example Calculation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 border">
            <h4 className="font-semibold mb-4">
              User with 10,000 followers posts their first tweet this week:
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Tweet gets 150 likes, 25 retweets</span>
                <span className="font-mono text-blue-600">
                  Impact: (10,000 × 0.001) + 150 + (25 × 2) = 210
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>First tweet of the day</span>
                <span className="font-mono text-green-600">Freshness: 3x</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Posted last week</span>
                <span className="font-mono text-purple-600">
                  Consistency: 1.25x
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>First tweet this week</span>
                <span className="font-mono text-orange-600">Decay: 1.0x</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between font-bold">
                  <span>Final Score</span>
                  <span className="font-mono text-purple-600">
                    210 × 3 × 1.25 × 1.0 = 787.5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span>Real-time Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Monitor engagement metrics and scores as they happen with live
              updates from our tracking system.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span>Fair Rankings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Our multi-factor scoring system ensures fair competition across
              users with different follower counts.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <span>Community Focus</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Designed to encourage authentic community engagement rather than
              gaming the system.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Telegram Bot CTA */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <ExternalLink className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold">Join Our Telegram Bot</h3>
            <p className="text-purple-100 max-w-2xl mx-auto">
              Get instant notifications when scores update, track your progress,
              and engage with the community directly through our Telegram bot.
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
                Start Using Bot
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
