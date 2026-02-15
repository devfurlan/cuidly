/**
 * Configurações centralizadas do aplicativo
 * Valores podem ser sobrescritos via variáveis de ambiente
 */

export const config = {
  /**
   * Configurações do site
   */
  site: {
    /**
     * URL base do site (sem barra final)
     * Pode ser configurado via NEXT_PUBLIC_SITE_URL no .env
     */
    url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://cuidly.com',

    /**
     * Nome do site
     */
    name: 'Cuidly',

    /**
     * URL da página de suporte
     */
    supportUrl: 'https://cuidly.com/app/suporte',
  },

  /**
   * Limites do plano gratuito
   */
  freePlan: {
    /**
     * Número máximo de perfis de babás que um usuário do plano gratuito pode visualizar
     * Pode ser configurado via FREE_PLAN_PROFILE_VIEW_LIMIT no .env
     */
    profileViewLimit: parseInt(process.env.FREE_PLAN_PROFILE_VIEW_LIMIT || '3', 10),
  },

  /**
   * Limites dos planos pagos
   */
  paidPlan: {
    /**
     * Planos pagos têm visualizações ilimitadas (-1 = ilimitado)
     */
    profileViewLimit: -1,
  },

  /**
   * Códigos dos cupons de win-back (cancelamento)
   * Esses cupons devem ser criados no admin com:
   * - hasUserRestriction: true
   * - applicableTo: NANNIES ou FAMILIES
   * - discountType: PERCENTAGE
   * - isActive: true (para ativar/desativar a promoção)
   */
  winback: {
    /**
     * Código do cupom de win-back para famílias
     * Pode ser configurado via WINBACK_COUPON_CODE_FAMILY no .env
     */
    familyCouponCode: process.env.WINBACK_COUPON_CODE_FAMILY || 'VOLTE-FAMILIA',

    /**
     * Código do cupom de win-back para babás
     * Pode ser configurado via WINBACK_COUPON_CODE_NANNY no .env
     */
    nannyCouponCode: process.env.WINBACK_COUPON_CODE_NANNY || 'VOLTE-BABA',
  },
} as const;

export type Config = typeof config;
