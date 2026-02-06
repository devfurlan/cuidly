'use client';

import PageContent from '@/components/layout/PageContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  type: string;
  label: string | null;
  description: string | null;
}

// Config keys
const CONFIG_KEYS = {
  NANNY_TRIAL_ENABLED: 'nanny_trial_enabled',
  NANNY_TRIAL_DAYS: 'nanny_trial_days',
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);

  // Form state
  const [nannyTrialEnabled, setNannyTrialEnabled] = useState(false);
  const [nannyTrialDays, setNannyTrialDays] = useState(0);

  useEffect(() => {
    loadConfigs();
  }, []);

  async function loadConfigs() {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Erro ao carregar configurações');

      const data = await response.json();
      setConfigs(data.configs);

      // Set form values from configs
      const trialEnabled = data.configs.find((c: SystemConfig) => c.key === CONFIG_KEYS.NANNY_TRIAL_ENABLED);
      const trialDays = data.configs.find((c: SystemConfig) => c.key === CONFIG_KEYS.NANNY_TRIAL_DAYS);

      if (trialEnabled) {
        setNannyTrialEnabled(trialEnabled.value === 'true');
      }
      if (trialDays) {
        setNannyTrialDays(parseInt(trialDays.value, 10) || 90);
      }
    } catch (error) {
      console.error('Error loading configs:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  }

  async function saveConfig(key: string, value: string | boolean | number, type: string, label: string, description: string) {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: String(value),
          type,
          label,
          description,
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar');
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }

  async function handleSave() {
    setIsSaving(true);

    try {
      const results = await Promise.all([
        saveConfig(
          CONFIG_KEYS.NANNY_TRIAL_ENABLED,
          nannyTrialEnabled,
          'boolean',
          'Trial Pro para Babas',
          'Ativar período de trial do plano Pro para novas babás'
        ),
        saveConfig(
          CONFIG_KEYS.NANNY_TRIAL_DAYS,
          nannyTrialDays,
          'number',
          'Dias do Trial',
          'Quantidade de dias do período trial do plano Pro'
        ),
      ]);

      if (results.every(Boolean)) {
        toast.success('Configurações salvas com sucesso!');
        loadConfigs();
      } else {
        toast.error('Erro ao salvar algumas configurações');
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <PageContent title="Configurações">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent title="Configurações do Sistema">
      <div className="space-y-6">
        {/* Nanny Trial Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Trial Pro para Babás</CardTitle>
            <CardDescription>
              Configure o período de trial gratuito do plano Pro para novas babás que completam o cadastro.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="trial-enabled">Ativar Trial</Label>
                <p className="text-sm text-muted-foreground">
                  Novas babás receberão o plano Pro gratuitamente por um período limitado
                </p>
              </div>
              <Switch
                id="trial-enabled"
                checked={nannyTrialEnabled}
                onCheckedChange={setNannyTrialEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trial-days">Duracao do Trial (dias)</Label>
              <Input
                id="trial-days"
                type="number"
                min={1}
                max={365}
                value={nannyTrialDays}
                onChange={(e) => setNannyTrialDays(parseInt(e.target.value, 10) || 0)}
                disabled={!nannyTrialEnabled}
                className="w-32"
              />
              <p className="text-sm text-muted-foreground">
                {nannyTrialDays} dias = {Math.round(nannyTrialDays / 30)} meses aproximadamente
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </PageContent>
  );
}
