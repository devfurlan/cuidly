'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircleIcon,
  XCircleIcon,
  CrownIcon,
  ProhibitIcon,
} from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentActivity {
  id: string;
  type: 'new_subscription' | 'payment_failed' | 'payment_success' | 'subscription_canceled';
  description: string;
  userName: string;
  createdAt: string | Date;
}

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

const activityConfig = {
  new_subscription: {
    icon: CrownIcon,
    color: 'bg-green-100 text-green-700',
    label: 'Nova Assinatura',
  },
  payment_success: {
    icon: CheckCircleIcon,
    color: 'bg-blue-100 text-blue-700',
    label: 'Pagamento',
  },
  payment_failed: {
    icon: XCircleIcon,
    color: 'bg-red-100 text-red-700',
    label: 'Falha',
  },
  subscription_canceled: {
    icon: ProhibitIcon,
    color: 'bg-orange-100 text-orange-700',
    label: 'Cancelamento',
  },
};

export function RecentActivities({ activities }: RecentActivitiesProps) {
  if (!activities.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>Últimas 10 atividades da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground py-8">
            Nenhuma atividade recente encontrada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Últimas 10 atividades da plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className={`rounded-full p-2 ${config.color}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">
                    {activity.userName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
