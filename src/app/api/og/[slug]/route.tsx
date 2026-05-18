import { ImageResponse } from "next/og";

export const runtime = "edge";

type OgProfile = {
  name: string;
  trade: string;
  location: string;
  accent: string;
  photo: string | null;
};

const DEMO_OG: OgProfile = {
  name: "Dave Wilson Plumbing",
  trade: "Plumber",
  location: "Manchester",
  accent: "#F97316",
  photo:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(req.url);

  const og: OgProfile =
    slug === "demo"
      ? DEMO_OG
      : {
          name: url.searchParams.get("name") ?? "Mytradelink",
          trade: url.searchParams.get("trade") ?? "Local tradesman",
          location: url.searchParams.get("location") ?? "United Kingdom",
          accent: url.searchParams.get("accent") ?? "#F97316",
          photo: url.searchParams.get("photo"),
        };

  const { name, trade, location, accent, photo } = og;
  const initial = (name[0] ?? "T").toUpperCase();
  const subtitle = `${trade}${location ? ` · ${location}` : ""}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0F172A",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* left accent stripe */}
        <div
          style={{
            width: "20px",
            height: "100%",
            background: accent,
            display: "flex",
          }}
        />

        {/* body */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "72px",
          }}
        >
          {/* top brand row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "-0.02em",
              }}
            >
              MYTRADELINK
            </div>
          </div>

          {/* spacer */}
          <div style={{ flex: 1, display: "flex" }} />

          {/* main row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "44px",
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                width={200}
                height={200}
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "999px",
                  objectFit: "cover",
                  border: `6px solid ${accent}`,
                }}
              />
            ) : (
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "999px",
                  background: accent,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "108px",
                  fontWeight: 900,
                  border: `6px solid ${accent}`,
                }}
              >
                {initial}
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: accent,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                {subtitle}
              </div>
              <div
                style={{
                  fontSize: "92px",
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                  display: "flex",
                }}
              >
                {name}
              </div>
            </div>
          </div>

          {/* spacer */}
          <div style={{ flex: 1, display: "flex" }} />

          {/* bottom row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                background: accent,
                color: "#0F172A",
                fontSize: "18px",
                fontWeight: 800,
                display: "flex",
              }}
            >
              mytradelink.app/t/{slug}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
