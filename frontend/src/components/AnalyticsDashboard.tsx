
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Star, DollarSign, Eye, Users } from 'lucide-react';

interface AnalyticsData {
  totalMenuItems: number;
  activeMenuItems: number;
  totalReviews: number;
  averageRating: number;
  totalViews: number;
  categoryData: Array<{
    category: string;
    count: number;
    avgPrice: number;
    avgRating: number;
    totalViews: number;
  }>;
  popularItems: Array<{
    title: string;
    price: number;
    reviewCount: number;
    avgRating: number;
    viewCount: number;
  }>;
  dietaryStats: {
    vegetarian: number;
    vegan: number;
    glutenFree: number;
    nutFree: number;
  };
  priceRanges: Array<{
    range: string;
    count: number;
  }>;
  viewTrends: Array<{
    date: string;
    views: number;
  }>;
}

interface AnalyticsDashboardProps {
  restaurantId: string;
}

const AnalyticsDashboard = ({ restaurantId }: AnalyticsDashboardProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  useEffect(() => {
    loadAnalytics();
  }, [restaurantId]);

  const loadAnalytics = async () => {
    try {
      // Fetch menu items with reviews and views
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_item_reviews (
            rating,
            review_text
          )
        `)
        .eq('restaurant_id', restaurantId);

      if (menuError) throw menuError;

      if (!menuItems) {
        setAnalytics({
          totalMenuItems: 0,
          activeMenuItems: 0,
          totalReviews: 0,
          averageRating: 0,
          totalViews: 0,
          categoryData: [],
          popularItems: [],
          dietaryStats: { vegetarian: 0, vegan: 0, glutenFree: 0, nutFree: 0 },
          priceRanges: [],
          viewTrends: []
        });
        return;
      }

      // Fetch view trends for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: viewsData, error: viewsError } = await supabase
        .from('menu_item_views')
        .select(`
          viewed_at,
          menu_item_id,
          menu_items!inner(restaurant_id)
        `)
        .eq('menu_items.restaurant_id', restaurantId)
        .gte('viewed_at', sevenDaysAgo.toISOString());

      if (viewsError) throw viewsError;

      // Process analytics data
      const totalMenuItems = menuItems.length;
      const activeMenuItems = menuItems.filter(item => item.is_active).length;
      
      // Calculate reviews
      const allReviews = menuItems.flatMap(item => item.menu_item_reviews || []);
      const totalReviews = allReviews.length;
      const averageRating = totalReviews > 0 
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      // Calculate total views
      const totalViews = menuItems.reduce((sum, item) => sum + (item.view_count || 0), 0);

      // Category analysis with views
      const categoryMap = new Map();
      menuItems.forEach(item => {
        if (!categoryMap.has(item.category)) {
          categoryMap.set(item.category, {
            category: item.category,
            items: [],
            totalPrice: 0,
            totalRating: 0,
            reviewCount: 0,
            totalViews: 0
          });
        }
        
        const cat = categoryMap.get(item.category);
        cat.items.push(item);
        cat.totalPrice += item.price;
        cat.totalViews += item.view_count || 0;

        const itemReviews = item.menu_item_reviews || [];
        if (itemReviews.length > 0) {
          cat.totalRating += itemReviews.reduce((sum: number, review: any) => sum + review.rating, 0);
          cat.reviewCount += itemReviews.length;
        }
      });

      const categoryData = Array.from(categoryMap.values()).map(cat => ({
        category: cat.category,
        count: cat.items.length,
        avgPrice: cat.totalPrice / cat.items.length,
        avgRating: cat.reviewCount > 0 ? cat.totalRating / cat.reviewCount : 0,
        totalViews: cat.totalViews
      }));

      // Popular items (by view count, then review count and rating)
      const popularItems = menuItems
        .map(item => {
          const reviews = item.menu_item_reviews || [];
          return {
            title: item.title,
            price: item.price,
            reviewCount: reviews.length,
            avgRating: reviews.length > 0 
              ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
              : 0,
            viewCount: item.view_count || 0
          };
        })
        .sort((a, b) => b.viewCount - a.viewCount || b.reviewCount - a.reviewCount || b.avgRating - a.avgRating)
        .slice(0, 5);

      // Dietary statistics
      const dietaryStats = {
        vegetarian: menuItems.filter(item => item.is_vegetarian).length,
        vegan: menuItems.filter(item => item.is_vegan).length,
        glutenFree: menuItems.filter(item => item.is_gluten_free).length,
        nutFree: menuItems.filter(item => item.is_nut_free).length
      };

      // Price range analysis
      const priceRanges = [
        { range: '$0-10', count: 0 },
        { range: '$10-20', count: 0 },
        { range: '$20-30', count: 0 },
        { range: '$30+', count: 0 }
      ];

      menuItems.forEach(item => {
        const price = item.price;
        if (price < 10) priceRanges[0].count++;
        else if (price < 20) priceRanges[1].count++;
        else if (price < 30) priceRanges[2].count++;
        else priceRanges[3].count++;
      });

      // Process view trends by day
      const viewTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayViews = (viewsData || []).filter(view => 
          view.viewed_at.startsWith(dateStr)
        ).length;
        
        viewTrends.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: dayViews
        });
      }

      setAnalytics({
        totalMenuItems,
        activeMenuItems,
        totalReviews,
        averageRating,
        totalViews,
        categoryData,
        popularItems,
        dietaryStats,
        priceRanges,
        viewTrends
      });

    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No analytics data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{analytics.totalMenuItems}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Items</p>
                <p className="text-2xl font-bold text-green-600">{analytics.activeMenuItems}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{analytics.totalReviews}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {analytics.averageRating.toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* View Trends */}
        <Card>
          <CardHeader>
            <CardTitle>View Trends (Last 7 Days)</CardTitle>
            <CardDescription>Daily menu item views</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.viewTrends}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [value, 'Views']}
                  />
                  <Line dataKey="views" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Views</CardTitle>
            <CardDescription>Total views by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.categoryData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [value, name === 'totalViews' ? 'Views' : name]}
                  />
                  <Bar dataKey="totalViews" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular Items and Price Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Items</CardTitle>
            <CardDescription>Based on views, reviews and ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.popularItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">{item.viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{item.avgRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{item.reviewCount} reviews</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Price Distribution</CardTitle>
            <CardDescription>Items by price range</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.priceRanges}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, count }) => `${range}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.priceRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Dietary Options */}
      <Card>
        <CardHeader>
          <CardTitle>Dietary Options</CardTitle>
          <CardDescription>Special dietary accommodations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vegetarian</span>
              <span className="text-2xl font-bold text-green-600">{analytics.dietaryStats.vegetarian}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vegan</span>
              <span className="text-2xl font-bold text-green-500">{analytics.dietaryStats.vegan}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Gluten Free</span>
              <span className="text-2xl font-bold text-blue-600">{analytics.dietaryStats.glutenFree}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nut Free</span>
              <span className="text-2xl font-bold text-orange-600">{analytics.dietaryStats.nutFree}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Category Insights</CardTitle>
          <CardDescription>Performance metrics by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Items</th>
                  <th className="text-right p-2">Total Views</th>
                  <th className="text-right p-2">Avg Price</th>
                  <th className="text-right p-2">Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {analytics.categoryData.map((category, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{category.category}</td>
                    <td className="p-2 text-right">{category.count}</td>
                    <td className="p-2 text-right">{category.totalViews}</td>
                    <td className="p-2 text-right">${category.avgPrice.toFixed(2)}</td>
                    <td className="p-2 text-right">
                      {category.avgRating > 0 ? category.avgRating.toFixed(1) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
