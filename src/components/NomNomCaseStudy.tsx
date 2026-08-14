import Link from "next/link";
import Image from "next/image";
import { caseNumber } from "@/lib/projects";
import styles from "./CaseStudy.module.css";

/**
 * NomNom case study. Copy is the author's own, verbatim — do not rewrite.
 * Only the Role and Tools metadata are added. Images are placeholders for now.
 */
export default function NomNomCaseStudy() {
  return (
    <article className={styles.page}>
      <div className="container">
        <Link href="/" className={styles.back}>
          Index
        </Link>

        <header className={styles.header}>
          <p className={styles.kicker}>Selected Work — {caseNumber("nomnom")}</p>
          <h1 className={styles.title}>
            Designing NomNom: Helping People Forecast Real-World Events Through
            Prediction Markets
          </h1>

          <dl className={styles.meta}>
            <div className={styles.metaItem}>
              <dt>Role</dt>
              <dd>Product Designer</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Tools</dt>
              <dd>Figma</dd>
            </div>
          </dl>

          <div className={styles.lead}>
            <p>{`NomNom is a predictive market app that allows users to bet on instances, probabilities or chances of an event happening.`}</p>
            <p>{`For example: Will PEPE flip FLOKI in terms of market cap before Lithuania invades Belarus?`}</p>
            <p>{`‘Yes for a Price’ or ‘No for a Price’`}</p>
          </div>
        </header>

        <figure className={styles.heroFigure} style={{ aspectRatio: "1512 / 982" }}>
          <video className={styles.heroVideo} autoPlay muted loop playsInline>
            <source src="/images/NomNom.webm" type="video/webm" />
          </video>
        </figure>

        <section className={styles.section}>
          <h2 className={styles.h2}>Building a Dynamic Onboarding</h2>
          <div className={styles.body}>
            <p>{`NomNom is a dynamic app for users who love to take financial risk, maybe a little more than risking on stock apps. To capture that appeal, we realised that user interest varies, so we needed to capture that interest during the onboarding, so users can have a more personal experience.`}</p>
            <p>{`So we asked about their interest from the onboarding.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/nomnom-onboarding.webp"
                alt="NomNom onboarding — capturing user interest"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Building an Obsession for NomNom</h2>
          <div className={styles.body}>
            <p>{`NomNom already is a dynamic app where content is created by users for other users like Facebook, X, Instagram etc.`}</p>
            <p>{`Users can create a market for other users to predict on and based on the outcome of the market they either make profit or loss, the market is set for a time limit which gets settled once the limit is reached.`}</p>
            <p>{`For users who bet on an outcome, they can increase their bets before the time runs out but cannot withdraw already placed bets before that time limit. However, the time of placing the bets decides what odds the bet will be worth, so placing a bet at exactly the start of a 5-hour market time count will be worth way more than placing it within 5 minutes to the close of that market.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/nomnom-obsession.webp"
                alt="NomNom — creating and betting on markets"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`Micro-interaction was introduced in the platform to ensure that the app does not look flat, for example:`}</p>
            <p>{`Moving candlesticks, a pulsing ‘volume change’ glow. This was inspired by the dynamism of tiktok.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <video className={styles.heroVideo} autoPlay muted loop playsInline>
                <source src="/images/Microinterations.webm" type="video/webm" />
              </video>
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`Social hooks were also added for example: “Friend is in this market” highlight. “Share this market” button was added to the cards`}</p>
            <p>{`The aim was to create more than an order ticket so we needed to create a hook which also helps users build trust to place their bets.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <video className={styles.heroVideo} autoPlay muted loop playsInline>
                <source src="/images/Friendsinthemarket.webm" type="video/webm" />
              </video>
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>
            Building a Social/Interactive Experience with the Market
          </h2>
          <div className={styles.body}>
            <p>{`Users are allowed to engage with the market as markets are dynamic posts made by the creators, so users who wish to place a bet or just generally engage, can comment and reply to comments like they would on instagram, x or any social media platform.`}</p>
            <p>{`The experience was built to support existing mental model of community driven apps which these platforms (x, instagram, tiktok, facebook etc) already provide, so rather than focus on a heavy market look and feel, it was made to feel like the user was hoping on another x or instagram app to chat with their friends.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/nomnom-comments.webp"
                alt="NomNom — commenting and replying within a market"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Leaderboard</h2>
          <div className={styles.body}>
            <p>{`This also allowed us to build a gamified experience where users rank based on their experience in the market, if they won or lost and the ranking position helped them gain xps which could be converted into funds to trade.`}</p>
            <p>{`Also, users can brag about their market position on other social platforms by sharing a snippet of their position in the market.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/nomnom-leaderboard.webp"
                alt="NomNom leaderboard — ranked market position"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Wallet</h2>
          <div className={styles.body}>
            <p>{`Like every market, users can add funds to their wallet from which they can use to place bets, method by which funds are added includes the following:`}</p>
            <p>{`payment using card, payment using coinbase and payment using moonpay.`}</p>
            <p>{`Using can also get paid to their preferred wallet address.`}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Smart Notifications/Nudges</h2>
          <div className={styles.body}>
            <p>{`Across the platform we ensured that actions taken by users were properly acknowledged using smart notifications and also nudges in non disruptive ways.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/nomnom-notifications.webp"
                alt="NomNom — smart notifications and nudges"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>User Testing</h2>
          <div className={styles.body}>
            <p>{`NomNom had an inhouse testing with a few users from the client’s community. It was a one-time project designed for a client in the US and I was a sub-contractor who didn’t have a direct link to how users interacted. Nom Nom isn’t live yet at the time of writing, so it’s currently still being developed but from the prototype interaction, we found good feedback from users which allowed the team to proceed with the developer handoff.`}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>In Conclusion</h2>
          <div className={styles.body}>
            <p>{`NomNom was created to support existing mental patterns of social communication but rather than allowing users who wanted to make more out of their social time just doomscroll, they could create or partake in distraction social free space which was solely tied to the financial market and because the UI wasn’t a traditional market UI, it felt relatable and drawn to engagement.`}</p>
          </div>
        </section>

        <Link href="/" className={styles.back}>
          Index
        </Link>
      </div>
    </article>
  );
}
