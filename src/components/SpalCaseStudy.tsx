import Link from "next/link";
import Image from "next/image";
import SpalHero from "./SpalHero";
import { caseNumber } from "@/lib/projects";
import styles from "./CaseStudy.module.css";

/**
 * SPAL case study. Copy is the author's own, verbatim — do not rewrite.
 * Role and Tools added; body images are placeholders; hero is the SpalHero reel.
 */
export default function SpalCaseStudy() {
  return (
    <article className={styles.page}>
      <div className="container">
        <Link href="/" className={styles.back}>
          Home
        </Link>

        <header className={styles.header}>
          <p className={styles.kicker}>Selected Work — {caseNumber("spal")}</p>
          <h1 className={styles.title}>
            Helping Small Businesses See What Their Numbers Are Saying
          </h1>

          <dl className={styles.meta}>
            <div className={styles.metaItem}>
              <dt>Role</dt>
              <dd>Product Designer</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Tools</dt>
              <dd>Figma, Claude</dd>
            </div>
          </dl>

          <div className={styles.lead}>
            <p>{`SPAL is a business intelligence application for small businesses to help them easily manage their sales and expenses while providing intelligent insights about the business based on the data provided.`}</p>
          </div>

          <a
            className={styles.visit}
            href="https://spal-five.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit site
          </a>
        </header>

        <SpalHero />

        <section className={styles.section}>
          <h2 className={styles.h2}>
            Most small businesses already keep records. They just don’t keep them
            in one place
          </h2>
          <div className={styles.body}>
            <p>{`While conversing with a friend who sells food on the street ‘the street bukka’, I realized that one of her pain points was that she couldn’t manage her accounting, she found it difficult to track her sales and expenses daily in a convenient way. Her memory was what she relied on and sometimes when she felt overwhelmed, she’d scribble something on a paper that had no means of surviving a week.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/spal-bukka.webp"
                alt="SPAL — the street bukka"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`Was the business doing well? Absolutely but the lack of data couldn’t make this a proper business that could scale rather it functioned as a hustler’s den, fighting to avoid hunger.`}</p>
            <p>{`The problem wasn’t a lack of data. It was a lack of clarity`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/spal-clarity.webp"
                alt="SPAL — a lack of clarity"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Opportunity</h2>
          <div className={styles.body}>
            <p>{`At that point, I was empathetic towards her, I could feel her passion and didn’t want her to only hustle but be able to structure with data to help influence her decisions.`}</p>
            <p>{`I first started by recommending other products, after she gave them a trial, her words were that:`}</p>
            <p>{`‘This is too complex for me, I don’t want to feel like an accountant, I just need something simple enough for me to understand`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/spal-opportunity.webp"
                alt="SPAL — something simple enough to understand"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`And that became the start of SPAL. A product simple enough that the uneducated woman or man passionate about their business with enough daily sales can use without any expert help.`}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Defining SPAL</h2>
          <div className={styles.body}>
            <p>{`SPAL isn’t a direct accounting software, it’s basically a financial intelligent platform that can help anyone who runs a daily business gain clarity about what their sales and expenses are through various means, voice, text, image etc.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/spal-defining.webp"
                alt="SPAL — data entry by voice, text or image"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`The aim simply is to help businesses who aren’t set up to be big businesses or to dream big to gain confidence in the numbers they see on SPAL whether daily or weekly or monthly or yearly and aim towards being more than a hustler’s den.`}</p>
            <p>{`We started with an MVP whereby the MVP is to allow users input their data using either voice, text or image and that data would be analyzed by the platform and simple insights like:`}</p>
            <p>{`What sells the most, which days are the most profitable would be provided.`}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Design Challenge</h2>
          <div className={styles.body}>
            <p>{`The challenge wasn’t about building another complicated software where most features don’t get used, it was keeping only the essentials and discarding the nice-to-have’s until needed.`}</p>
            <p>{`What do the target audience (everyday selling businesses) need to ensure that their data is adequately catered for?`}</p>
            <p>{`I had to talk to not just my friend but similar businesses I had been patronizing to get their insights.`}</p>
            <p>{`Once I realized what they wanted, I had to ensure that data was captured from the onboarding, so the experience could feel more personal.`}</p>
            <p>{`What business does the user run and what they were struggling with and would love to achieve with SPAL.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/spal-onboarding.webp"
                alt="SPAL — onboarding captures the business"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`Then I had to cater to different user needs of how they recorded data, one challenge was that most of the businesses were adamant to change, they loved the notes they used or the reliance on their memory and would feel reluctant when I said there is an app to do what they currently were doing.`}</p>
            <p>{`However, I noticed that when I said they could either write or use their voice or use images, they gave me their attention.`}</p>
            <p>{`So, I had to ensure data entry in those forms were catered for.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/spal-dataentry.webp"
                alt="SPAL — data entry by write, voice or image"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The AI Layer (SPARK)</h2>
          <div className={styles.body}>
            <p>{`Spark is the AI partner on SPAL where users can get a summary of their data and interact with it for better insight. E.g. I sold less rice and beans today, can you tell me how I might improve the sales tomorrow?`}</p>
            <p>{`Spark can analyse their sales history and based on aggregate data, it would provide the best possible answer to how the user might improve their sales record.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/spal-spark.webp"
                alt="SPAL — Spark, the AI partner"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Impact</h2>
          <div className={styles.body}>
            <p>{`After designing, including the brand, I built SPAL using Claude. Deployed and tested with over 30 users.`}</p>
            <p>{`Built a waiting list page where I collected data from interested users and have been sending them email newsletters about SPAL while over 10 users have been onboarded on the beta app where we occasionally go and engage with them on their experience and how we can improve the app before we launch.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/spal-impact.webp"
                alt="SPAL — the impact"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`One very notable achievement is the assurance from a supermarket in a mall in Abuja, Nigeria, that if we were to bring a desktop version of SPAL with an inclusion of inventory where they can scan products and get it updated, they will adopt the product.`}</p>
          </div>
        </section>

        <Link href="/" className={styles.back}>
          Home
        </Link>
      </div>
    </article>
  );
}
