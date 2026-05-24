export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  const username = req.query.username;

  if (!username) {
    return res.status(400).json({
      success: false,
      error: "Instagram username required"
    });
  }

  try {

    const cleanUsername = username.replace("@", "");

    const response = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "X-IG-App-ID": "936619743392459",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": `https://www.instagram.com/${cleanUsername}/`
        }
      }
    );

    const json = await response.json();

    if (!json.data || !json.data.user) {
      return res.status(404).json({
        success: false,
        error: "Instagram user not found"
      });
    }

    const user = json.data.user;

    // ACCOUNT CREATED YEAR
    let createdYear = "N/A";

    if (user.id) {
      const timestamp = Number(user.id) >> 22;
      const instaEpoch = 1314220021721;
      const createdDate = new Date(timestamp + instaEpoch);

      if (!isNaN(createdDate)) {
        createdYear = createdDate.getFullYear();
      }
    }

    // TEXT RESULT
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
📅 Account Created: ${createdYear}
🖼️ Profile Pic: ${user.profile_pic_url_hd || user.profile_pic_url}
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
