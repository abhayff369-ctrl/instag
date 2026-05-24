export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const username = req.query.username;

  if (!username) {
    return res.status(400).json({
      success: false,
      error: "Username required"
    });
  }

  try {

    const clean = username.replace("@", "");

    const response = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${clean}`,
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "X-IG-App-ID": "936619743392459",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": `https://www.instagram.com/${clean}/`,
          "Accept": "*/*"
        }
      }
    );

    // TEXT FIRST
    const textResponse = await response.text();

    // EMPTY RESPONSE CHECK
    if (!textResponse || textResponse.length < 5) {
      return res.status(500).json({
        success: false,
        error: "Empty response from Instagram"
      });
    }

    let json;

    // SAFE JSON PARSE
    try {
      json = JSON.parse(textResponse);
    } catch (e) {
      return res.status(500).json({
        success: false,
        error: "Instagram blocked request",
        raw: textResponse.substring(0, 300)
      });
    }

    if (!json.data || !json.data.user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const user = json.data.user;

    const resultText = `
🔍 INSTAGRAM LOOKUP RESULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lookup Result for: @${user.username}
────────────────────────

🆔 ID: ${user.id || "N/A"}
👤 Username: @${user.username}
📛 Full Name: ${user.full_name || "N/A"}
📝 Bio: ${user.biography || "N/A"}
🔒 Private: ${user.is_private ? "Yes" : "No"}
✅ Verified: ${user.is_verified ? "Yes" : "No"}
🏢 Business: ${user.is_professional_account ? "Yes" : "No"}
📚 Category: ${user.category_name || "N/A"}
🔗 External URL: ${user.external_url || "N/A"}
👥 Followers: ${user.edge_followed_by?.count || 0}
👣 Following: ${user.edge_follow?.count || 0}
📸 Posts: ${user.edge_owner_to_timeline_media?.count || 0}
🖼️ Profile Pic: ${user.profile_pic_url_hd || user.profile_pic_url}

────────────────────────
`;

    return res.status(200).json({
      success: true,
      result: resultText.trim()
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }

}
