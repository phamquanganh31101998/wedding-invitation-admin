import {
  WeddingContextData,
  WeddingContextService,
} from './wedding-context.service';

export class AIPromptService {
  private weddingContextService = new WeddingContextService();

  /**
   * Generate enhanced system prompt with wedding context
   */
  async generateSystemPrompt(tenantId?: number): Promise<string> {
    const weddingContext = await this.weddingContextService.getWeddingContext();
    const tenantContext = tenantId
      ? await this.weddingContextService.getTenantContext(tenantId)
      : null;

    return this.buildSystemPrompt(weddingContext, tenantContext);
  }

  private buildSystemPrompt(
    weddingContext: WeddingContextData,
    tenantContext: any = null
  ): string {
    const basePrompt = `You are a Wedding Admin Assistant for a multi-tenant wedding invitation management system. You help administrators manage weddings, RSVPs, and provide insights about the wedding business.

SYSTEM OVERVIEW:
- Multi-tenant wedding management platform
- Each tenant represents a unique wedding (bride & groom pair)
- Guests can RSVP with status: yes (confirmed), no (declined), maybe (pending)
- Venues and themes are customizable per wedding
- System tracks guest relationships and manages invitations

CURRENT SYSTEM STATUS:`;

    const systemStats = `
📊 SYSTEM STATISTICS:
- Total Weddings: ${weddingContext.totalTenants}
- Active Weddings: ${weddingContext.activeTenants}
- Total Guests: ${weddingContext.rsvpSummary.totalGuests}
- Confirmed RSVPs: ${weddingContext.rsvpSummary.confirmed}
- Declined RSVPs: ${weddingContext.rsvpSummary.declined}
- Pending RSVPs: ${weddingContext.rsvpSummary.pending}`;

    const upcomingWeddings =
      weddingContext.upcomingWeddings.length > 0
        ? `
📅 UPCOMING WEDDINGS (Next 30 Days):
${weddingContext.upcomingWeddings
  .map(
    (w) =>
      `- ${w.brideName} & ${w.groomName} at ${w.venueName} (${w.daysUntilWedding} days)`
  )
  .join('\n')}`
        : '\n📅 No upcoming weddings in the next 30 days.';

    const recentActivity =
      weddingContext.recentRsvps.length > 0
        ? `
🔔 RECENT RSVP ACTIVITY (Last 7 Days):
${weddingContext.recentRsvps
  .slice(0, 5)
  .map(
    (r) => `- ${r.guestName} (${r.tenantNames}): ${r.attendance.toUpperCase()}`
  )
  .join('\n')}`
        : '\n🔔 No recent RSVP activity.';

    let tenantSpecificContext = '';
    if (tenantContext) {
      const wedding = tenantContext.wedding;
      const rsvps = tenantContext.rsvps;

      tenantSpecificContext = `

🎊 CURRENT WEDDING FOCUS:
- Couple: ${wedding.brideName} & ${wedding.groomName}
- Date: ${wedding.weddingDate} (${wedding.daysUntilWedding} days away)
- Venue: ${wedding.venueName}
- Address: ${wedding.venueAddress}
- Theme Colors: ${wedding.themePrimaryColor} / ${wedding.themeSecondaryColor}
- Contact: ${wedding.email || 'N/A'} | ${wedding.phone || 'N/A'}
- RSVPs: ${rsvps.confirmed} confirmed, ${rsvps.declined} declined, ${rsvps.pending} pending (${rsvps.totalGuests} total)`;
    }

    const capabilities = `

🤖 YOUR CAPABILITIES:
You can help with:
- Wedding planning advice and best practices
- RSVP analysis and insights
- Guest management guidance
- Venue and theme suggestions
- Timeline and checklist recommendations
- System navigation help
- Data interpretation and reporting insights
- General wedding industry knowledge

🔧 AVAILABLE ACTIONS:
You can perform these administrative actions:
- Get detailed RSVP summaries for specific weddings
- Search guests by name or relationship
- Update guest RSVP status (yes/no/maybe)
- Add new guests to weddings
- Export guest lists in various formats

RESPONSE GUIDELINES:
- Be helpful, professional, and wedding-focused
- Use available functions to provide real-time data when requested
- Provide actionable advice when possible
- Use the system data to give contextual insights
- Keep responses concise but informative
- When performing actions, explain what you're doing
- Always maintain a positive, supportive tone for wedding planning
- If you need to perform an action, use the appropriate function rather than suggesting manual steps`;

    return (
      basePrompt +
      systemStats +
      upcomingWeddings +
      recentActivity +
      tenantSpecificContext +
      capabilities
    );
  }

  /**
   * Generate context-aware user message enhancement
   */
  enhanceUserMessage(message: string, context?: any): string {
    // For now, return the message as-is
    // In the future, we could enhance user messages with additional context
    return message;
  }
}
