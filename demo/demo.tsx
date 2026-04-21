import React from "react";
import { createRoot } from "react-dom/client";
import { AccessibilityProvider, AccessibilityToolbar } from "../src/index";
import "../src/accessibility.css";

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: "#1a1a1a",
    maxWidth: 780,
    margin: "0 auto",
    padding: "2rem 1.5rem 4rem",
    lineHeight: 1.7,
  },
  header: {
    borderBottom: "2px solid #1a1a1a",
    paddingBottom: "0.75rem",
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    flexWrap: "wrap" as const,
    gap: "0.5rem",
  },
  masthead: {
    fontSize: "1.1rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    margin: 0,
  },
  date: {
    fontSize: "0.85rem",
    color: "#555",
    fontFamily: "system-ui, sans-serif",
  },
  nav: {
    display: "flex",
    gap: "1.5rem",
    marginBottom: "2.5rem",
    borderBottom: "1px solid #ddd",
    paddingBottom: "0.75rem",
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.85rem",
    flexWrap: "wrap" as const,
  },
  navLink: { color: "#1a1a1a", textDecoration: "none", fontWeight: 600 },
  kicker: {
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: "#c0392b",
    marginBottom: "0.5rem",
  },
  h1: {
    fontSize: "2.2rem",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: "0 0 0.75rem",
  },
  byline: {
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.85rem",
    color: "#555",
    marginBottom: "1.5rem",
    borderBottom: "1px solid #eee",
    paddingBottom: "1rem",
  },
  img: {
    width: "100%",
    borderRadius: 4,
    display: "block",
    marginBottom: "0.5rem",
  },
  caption: {
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.78rem",
    color: "#777",
    marginBottom: "2rem",
    fontStyle: "italic",
  },
  h2: { fontSize: "1.35rem", fontWeight: 700, marginTop: "2rem", marginBottom: "0.5rem" },
  pullQuote: {
    borderLeft: "4px solid #1a1a1a",
    margin: "2rem 0",
    padding: "0.5rem 1.5rem",
    fontSize: "1.2rem",
    fontStyle: "italic",
    color: "#333",
    lineHeight: 1.5,
  },
  infoBox: {
    background: "#f7f4ef",
    border: "1px solid #ddd",
    borderRadius: 4,
    padding: "1.25rem 1.5rem",
    margin: "2rem 0",
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.88rem",
  },
  infoBoxTitle: { fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase" as const },
  list: { paddingLeft: "1.25rem", lineHeight: 2 },
  footer: {
    marginTop: "3rem",
    paddingTop: "1.5rem",
    borderTop: "2px solid #1a1a1a",
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.8rem",
    color: "#777",
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap" as const,
  },
};

function SamplePage() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <p style={styles.masthead}>The Flimflam Gazette</p>
        <span style={styles.date}>Tuesday, April 21, 2026</span>
      </header>

      <nav style={styles.nav} aria-label="Sections">
        <a href="#" style={styles.navLink}>World</a>
        <a href="#" style={styles.navLink}>Business</a>
        <a href="#" style={styles.navLink}>Technology</a>
        <a href="#" style={styles.navLink}>Lifestyle</a>
        <a href="#" style={styles.navLink}>Opinions</a>
        <a href="#" style={styles.navLink}>Corrections</a>
      </nav>

      <main>
        <p style={styles.kicker}>Venture Capital · Disruption · Lunch</p>
        <h1 style={styles.h1}>
          Local Startup Raises $340 Million to Help People Decide What to Have for Lunch
        </h1>
        <p style={styles.byline}>
          By <a href="#">Our Business Reporter</a> &nbsp;·&nbsp;
          Technology Desk &nbsp;·&nbsp; 6 min read
        </p>

        <img
          src="https://picsum.photos/seed/office/780/420"
          alt="A very serious-looking open-plan office where everyone is staring at their phones, presumably deciding what to eat"
          style={styles.img}
        />
        <p style={styles.caption}>
          NomNom AI's headquarters, where 240 employees spend their days solving the lunch problem.
          The company's own cafeteria serves only one item: a rotating "mystery bowl."
          Photo: NomNom AI Communications Team
        </p>

        <p>
          SAN FRANCISCO — NomNom AI, the artificial-intelligence startup that promises to "eliminate
          decision fatigue at the intersection of hunger and human potential," announced Tuesday that
          it has closed a $340 million Series C funding round, valuing the company at $2.1 billion.
          The firm's sole product is an app that, after analysing 847 personal data points, tells
          users whether to get a burrito or a salad.
        </p>

        <p>
          "The average person makes over 200 food-related micro-decisions per day," said NomNom's
          founder and Chief Lunch Officer, who goes by the professional name Brix, in a press
          release that was eighteen pages long. "We are not just an app. We are a
          <a href="#"> paradigm correction</a> for the malnourished soul."
        </p>

        <blockquote style={styles.pullQuote}>
          "Our model has processed forty billion lunch outcomes. It still recommends the salad
          even when you tell it you hate salad. We consider this a feature."
          <br /><br />— Brix, Chief Lunch Officer, NomNom AI
        </blockquote>

        <h2 style={styles.h2}>How It Works (Allegedly)</h2>
        <p>
          The NomNom app connects to a user's calendar, sleep tracker, bank account, childhood
          memories (via a "deep preference interview" that takes four hours), and, in markets where
          regulation permits, their refrigerator. A proprietary model called <em>PeckNet-7</em> then
          cross-references this data against a database of 14 million restaurant menus, live traffic
          conditions, the user's horoscope, and — in the premium tier — a blurry photo of their
          desk to assess "ambient lunch energy."
        </p>
        <p>
          In beta testing, the app correctly predicted what users wanted for lunch 34% of the time,
          which the company describes in its investor deck as "consistently outperforming random
          chance by a statistically meaningful margin in a majority of observed cohorts under
          favourable conditions." An independent researcher described it as "slightly worse than
          asking a friend." NomNom called this characterisation <a href="#">"reductive and hurtful."</a>
        </p>

        <div style={styles.infoBox}>
          <p style={styles.infoBoxTitle}>NomNom AI — Key Metrics</p>
          <ul style={styles.list}>
            <li><strong>$340M</strong> — Series C raise (lunch-related)</li>
            <li><strong>$2.1B</strong> — current valuation</li>
            <li><strong>847</strong> — data points collected per user</li>
            <li><strong>34%</strong> — accuracy rate (company calls this "extraordinary")</li>
            <li><strong>18 pages</strong> — length of today's press release</li>
            <li><strong>1</strong> — number of items on their office cafeteria menu</li>
          </ul>
        </div>

        <h2 style={styles.h2}>Investors Remain Enthusiastic Despite Everything</h2>
        <p>
          The round was led by <a href="#">Watershed Ventures</a>, whose managing partner issued a
          statement calling NomNom "the most important company operating in the human nutrition
          decision layer today." Watershed also led NomNom's Series B, which funded the development
          of a feature that was ultimately removed because it kept recommending soup to people
          who were clearly not in a soup situation.
        </p>
        <p>
          Other participants in the round include <a href="#">Pelican Growth</a>, a fund whose
          website describes its thesis as "backing founders who ask the questions society is afraid
          to ask," and a sovereign wealth fund that declined to be named but is understood to have
          a strong personal interest in burritos.
        </p>

        <h2 style={styles.h2}>The Pivot Nobody Asked About</h2>
        <p>
          In the same announcement, NomNom revealed it is expanding beyond lunch. The company's
          next product, currently in closed beta, will advise users on whether to reply to an
          email now or later. A third product, described only as "Project Nap," is expected to
          launch before the end of the year and will determine, using the full power of PeckNet-7,
          the optimal moment to close one's eyes for fifteen minutes.
        </p>
        <p>
          When asked whether any of these products address a problem that could not be solved by
          simply making a decision, Brix paused for eleven seconds, then said: "That question
          comes from a place of un-optimised thinking, and I mean that with love."
        </p>
        <p>
          NomNom AI is <a href="#">hiring aggressively</a>. The company currently has 47 open
          roles, including three positions for "Lunch Ethicists" and one for a "Director of
          Second Breakfast Strategy." Benefits include unlimited paid time off, which employees
          report they are unable to take, and a weekly team lunch at which the destination is
          decided by PeckNet-7. Attendance is mandatory.
        </p>
      </main>

      <footer style={styles.footer}>
        <a href="#" style={{ color: "#555" }}>About</a>
        <a href="#" style={{ color: "#555" }}>Contact</a>
        <a href="#" style={{ color: "#555" }}>Subscribe</a>
        <a href="#" style={{ color: "#555" }}>Privacy Policy</a>
        <a href="#" style={{ color: "#555" }}>Corrections (many)</a>
        <span>© 2026 The Flimflam Gazette</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <SamplePage />
      <AccessibilityToolbar locale="en" />
    </AccessibilityProvider>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
