
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AnalyticsDashboard from '../AnalyticsDashboard';

interface AnalyticsTabProps {
  restaurantId: string;
}

const AnalyticsTab = ({ restaurantId }: AnalyticsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
        <CardDescription>
          Insights into your menu performance and customer preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnalyticsDashboard restaurantId={restaurantId} />
      </CardContent>
    </Card>
  );
};

export default AnalyticsTab;
