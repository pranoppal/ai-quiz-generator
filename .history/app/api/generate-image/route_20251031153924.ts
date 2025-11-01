import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Missing topic field" },
        { status: 400 }
      );
    }

    // Use Unsplash API to fetch a relevant image
    // If you don't have an Unsplash API key, it will fall back to a placeholder
    const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (unsplashAccessKey) {
      try {
        // /topics/:id_or_slug/photos
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            topic
          )}&orientation=landscape&page=1&per_page=1`,
          {
            headers: {
              Authorization: `Client-ID ${unsplashAccessKey}`,
            },
          }
        );

        if (unsplashResponse.ok) {
          const data = await unsplashResponse.json()?.results?.[0];
          console.log(data, data.urls);
          return NextResponse.json({
            imageUrl: data.urls.regular,
            imageUrlBlur: data.urls.small,
            attribution: {
              photographer: data.user.name,
              photographerUrl: data.user.links.html,
              unsplashUrl: data.links.html,
            },
          });
        }
      } catch (unsplashError) {
        console.error("Unsplash API error:", unsplashError);
        // Fall through to generate a gradient background
      }
    }

    // Fallback: Generate a gradient based on the topic's hash
    const imageUrl = generateGradientForTopic(topic);

    return NextResponse.json({
      imageUrl,
      imageUrlBlur: imageUrl,
      attribution: null,
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

// Generate a deterministic gradient based on topic
function generateGradientForTopic(topic: string): string {
  // Create a simple hash from the topic
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = (hash << 5) - hash + topic.charCodeAt(i);
    hash = hash & hash;
  }

  // Generate colors from the hash
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;
  const hue3 = (hue1 + 120) % 360;

  return `linear-gradient-${hue1}-${hue2}-${hue3}`;
}
