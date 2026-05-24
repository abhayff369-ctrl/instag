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
      `https://www.instagram.com/${clean}/`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
      }
    );

    const html = await response.text();

    if (!html.includes("profile_pic_url")) {
      return res.status(500).json({
        success: false,
        error: "Instagram blocked request"
      });
    }

    // EXTRACT JSON
    const jsonMatch = html.match(
      /"profilePage_(.*?)",/s
    );

    // PROFILE PIC
    const picMatch = html.match(
      /"profile_pic_url_hd":"(.*?)"/
    );

    // FULL NAME
    const nameMatch = html.match(
      /"full_name":"(.*?)"/
    );

    // BIO
    const bioMatch = html.match(
      /"biography":"(.*?)"/
    );

    // FOLLOWERS
    const followersMatch = html.match(
      /"edge_followed_by":{"count":(.*?)}/
    );

    // FOLLOWING
    const followingMatch = html.match(
      /"edge_follow":{"count":(.*?)}/
    );

    // POSTS
    const postMatch = html.match(
      /"edge_owner_to_timeline_media":{"count":(.*?)}/
    );

    // VERIFIED
    const verifiedMatch = html.match(
      /"is_verified":(true|false)/
    );

    // PRIVATE
    const privateMatch = html.match(
      /"is_private":(true|false)/
    );

    const resultText = `
🔍 INSTAGRAM LOOKUP RESULT
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lookup Result for: @${clean}
────────────────────────

👤 Username: @${clean}
📛 Full Name: ${nameMatch ? nameMatch[1] : "N/A"}
📝 Bio: ${bioMatch ? bioMatch[1] : "N/A"}
🔒 Private: ${privateMatch && privateMatch[1] === "true" ? "Yes" : "No"}
✅ Verified: ${verifiedMatch && verifiedMatch[1] === "true" ? "Yes" : "No"}
👥 Followers: ${followersMatch ? followersMatch[1] : "0"}
👣 Following: ${followingMatch ? followingMatch[1] : "0"}
📸 Posts: ${postMatch ? postMatch[1] : "0"}
🖼️ Profile Pic: ${picMatch ? picMatch[1].replace(/\\u0026/g, "&") : "N/A"}

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
