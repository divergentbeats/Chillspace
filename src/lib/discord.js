// Discord API utility functions

// Discord API configuration
const DISCORD_API_BASE = 'https://discord.com/api/v10';
const BOT_TOKEN = process.env.REACT_APP_DISCORD_BOT_TOKEN; // Add this to your .env file

/**
 * Fetches Discord server details using an invite code
 * @param {string} inviteCode - The Discord invite code (e.g., 'abc123')
 * @returns {Promise<Object|null>} Server details or null if failed
 */
export const fetchDiscordServerDetails = async (inviteCode) => {
  try {
    const response = await fetch(`${DISCORD_API_BASE}/invites/${inviteCode}?with_counts=true`);

    if (!response.ok) {
      console.warn(`Failed to fetch Discord server details for invite ${inviteCode}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      name: data.guild?.name || 'Unknown Server',
      icon: data.guild?.icon ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png` : null,
      onlineMembers: data.approximate_presence_count || 0,
      totalMembers: data.approximate_member_count || 0,
      inviteUrl: `https://discord.gg/${inviteCode}`,
      inviteCode: inviteCode,
      id: data.guild?.id
    };
  } catch (error) {
    console.error(`Error fetching Discord server details for invite ${inviteCode}:`, error);
    return null;
  }
};

/**
 * Fetches user's joined Discord servers using OAuth2 access token
 * @param {string} accessToken - Discord OAuth2 access token
 * @returns {Promise<Array<Object>>} Array of user's joined servers
 */
export const fetchUserDiscordServers = async (accessToken) => {
  try {
    const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch user Discord servers: ${response.status}`);
      return [];
    }

    const servers = await response.json();

    // Filter to only include servers where user has permission to see channels
    const accessibleServers = servers.filter(server =>
      (server.permissions & 0x400) !== 0 || server.owner // VIEW_CHANNELS permission or owner
    );

    return accessibleServers.map(server => ({
      id: server.id,
      name: server.name,
      icon: server.icon ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png` : null,
      owner: server.owner,
      permissions: server.permissions,
      features: server.features
    }));
  } catch (error) {
    console.error('Error fetching user Discord servers:', error);
    return [];
  }
};

/**
 * Fetches Discord servers where the bot is present using bot token
 * @returns {Promise<Array<Object>>} Array of bot's servers
 */
export const fetchBotDiscordServers = async () => {
  if (!BOT_TOKEN) {
    console.warn('Discord bot token not configured. Set REACT_APP_DISCORD_BOT_TOKEN in .env');
    return [];
  }

  try {
    const response = await fetch(`${DISCORD_API_BASE}/users/@me/guilds`, {
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch bot Discord servers: ${response.status}`);
      return [];
    }

    const servers = await response.json();

    return servers.map(server => ({
      id: server.id,
      name: server.name,
      icon: server.icon ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png` : null,
      owner: server.owner,
      permissions: server.permissions,
      features: server.features
    }));
  } catch (error) {
    console.error('Error fetching bot Discord servers:', error);
    return [];
  }
};

/**
 * Fetches detailed information for a specific Discord server
 * @param {string} serverId - Discord server ID
 * @param {string} accessToken - Optional OAuth2 access token for user servers
 * @returns {Promise<Object|null>} Detailed server information
 */
export const fetchDiscordServerInfo = async (serverId, accessToken = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (BOT_TOKEN) {
      headers['Authorization'] = `Bot ${BOT_TOKEN}`;
    } else {
      console.error('No authentication method available for Discord API');
      return null;
    }

    const response = await fetch(`${DISCORD_API_BASE}/guilds/${serverId}?with_counts=true`, {
      headers
    });

    if (!response.ok) {
      console.error(`Failed to fetch Discord server info for ${serverId}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      icon: data.icon ? `https://cdn.discordapp.com/icons/${data.id}/${data.icon}.png` : null,
      banner: data.banner ? `https://cdn.discordapp.com/banners/${data.id}/${data.banner}.png` : null,
      splash: data.splash ? `https://cdn.discordapp.com/splashes/${data.id}/${data.splash}.png` : null,
      description: data.description,
      memberCount: data.approximate_member_count || 0,
      onlineCount: data.approximate_presence_count || 0,
      features: data.features,
      verificationLevel: data.verification_level,
      explicitContentFilter: data.explicit_content_filter
    };
  } catch (error) {
    console.error(`Error fetching Discord server info for ${serverId}:`, error);
    return null;
  }
};

/**
 * Fetches details for multiple Discord servers
 * @param {Array<string>} inviteCodes - Array of Discord invite codes
 * @returns {Promise<Array<Object>>} Array of server details
 */
export const fetchMultipleDiscordServers = async (inviteCodes) => {
  const promises = inviteCodes.map(code => fetchDiscordServerDetails(code));
  const results = await Promise.allSettled(promises);

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Failed to fetch server for invite ${inviteCodes[index]}:`, result.reason);
      return null;
    }
  }).filter(Boolean); // Remove null results
};

/**
 * Extracts invite code from a Discord invite URL
 * @param {string} url - Discord invite URL
 * @returns {string|null} Invite code or null if invalid
 */
export const extractInviteCode = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'discord.gg' || urlObj.hostname === 'discord.com') {
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1];
    }
    return null;
  } catch (error) {
    console.error('Invalid Discord URL:', url);
    return null;
  }
};

/**
 * Discord OAuth2 URL generator
 * @param {string} clientId - Discord application client ID
 * @param {string} redirectUri - OAuth2 redirect URI
 * @returns {string} OAuth2 authorization URL
 */
export const getDiscordOAuth2Url = (clientId, redirectUri) => {
  const scopes = ['identify', 'guilds', 'guilds.members.read'];
  const scopeString = scopes.join('%20');

  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopeString}`;
};

/**
 * Exchanges OAuth2 code for access token
 * @param {string} code - OAuth2 authorization code
 * @param {string} clientId - Discord application client ID
 * @param {string} clientSecret - Discord application client secret
 * @param {string} redirectUri - OAuth2 redirect URI
 * @returns {Promise<Object|null>} Access token data or null if failed
 */
export const exchangeDiscordCode = async (code, clientId, clientSecret, redirectUri) => {
  try {
    const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      console.error(`Failed to exchange Discord code: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging Discord code:', error);
    return null;
  }
};
