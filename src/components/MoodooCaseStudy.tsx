import Link from "next/link";
import Image from "next/image";
import { caseNumber } from "@/lib/projects";
import styles from "./CaseStudy.module.css";

/**
 * Moodoo case study. Copy is the author's own, verbatim — do not rewrite.
 * Role and Tools added; all images are placeholders for now.
 */
export default function MoodooCaseStudy() {
  return (
    <article className={styles.page}>
      <div className="container">
        <Link href="/" className={styles.back}>
          Index
        </Link>

        <header className={styles.header}>
          <p className={styles.kicker}>Selected Work — {caseNumber("moodoo")}</p>
          <h1 className={styles.title}>
            Designing a B2B Employee Mood Intelligence Platform That Helps
            Managers Understand Team Wellbeing Before Burnout Happens
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
            <p>{`Moodoo is a mood tracking app that helps teams and individuals within an organization to see their mood patterns.`}</p>
            <p>{`With Moodoo, teams get to find visual cues on what their moods are on what day and how often they either have a positive, neutral or negative mood.`}</p>
          </div>
        </header>

        <figure className={styles.heroFigure} style={{ aspectRatio: "1512 / 982" }}>
          <video className={styles.heroVideo} autoPlay muted loop playsInline>
            <source src="/images/moodoo-hero.webm" type="video/webm" />
          </video>
        </figure>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Research</h2>
          <div className={styles.body}>
            <p>{`We can all agree that moods are fluctuating patterns which change based on internal and external factors. That understanding influenced my employer during our daily standups to ask how each individual was feeling at the time, our responses were summarized into an average that defined the studio health.`}</p>
            <p>{`The data collected during standup however was lost after it and although insightful during standup, the pattern couldn’t be identified over weeks or months, so because we knew how crucial moods are, we knew we needed a more central solution, which became the birth of Moodoo.`}</p>
            <p>{`While it was birth internally, Moodoo became a platform for organizations.`}</p>
            <p>{`So our research focused on which organizations suffered the most employee burnouts.`}</p>
            <p>{`small studio managers, people/happiness managers, remote teams, ad agencies, and in-house creative/design teams.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <video className={styles.heroVideo} autoPlay muted loop playsInline>
                <source src="/images/moodoo-research.webm" type="video/webm" />
              </video>
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>
            EMOTIONAL VALENCE AROUSAL MATRIX/EMOTIONAL WHEEL
          </h2>
          <div className={styles.body}>
            <p>{`The matrix is a psychological concept designed by James Russell which has proven to be useful even to apple as an organization.`}</p>
            <p>{`The aim was to build a simple tool that allows individuals to comfortably check in with their moods daily without feeling like they are within a working environment.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/moodoo-valence.webp"
                alt="Moodoo — emotional valence–arousal matrix"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Mandala</h2>
          <div className={styles.body}>
            <p>{`During benchmarking, we saw that traditional mood tracking applications focused on representing emotions with emojis and very linear concepts to me, it didn’t feel psychological or tied to any concept, it felt pretty bland. So having understood the emotional valence arousal matrix, we concluded that allowing users to check their emotions following the Pleasant/Unpleasant vs High Energy/Low Energy quadrant was more psychological but simple to relate to. That’s where we felt the Mandala would work best, in the sense that rather than work with the linear emoji pattern that clouds the market without deep rooted psychological knowledge, we decided to build around an abstract but relatable concept of a mandala which allowed us to match energy and pleasantness through the number of petals/the roundness of the petals shown on a quadrant selection.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/moodoo-mandala.webp"
                alt="Moodoo — the mandala mood selector"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`Besides focusing on the mandala, we wanted to build a homepage that felt welcoming to the user, allowing them to check in by showing a sense of understanding.`}</p>
            <p>{`It allowed us to ask the user how they are feeling anytime they log into the app, this gives them a sense of feeling to be open, right there is a full canvas allowing the user to interact and select any quadrant which represents a mandala.`}</p>
            <p>{`The idea is to build a sense of ease and non-judgment, even if its for a team or individual within an organization, the app is made to feel very personal rather than a typical company platform with technical jargons.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/moodoo-checkin.webp"
                alt="Moodoo — daily mood check-in"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Individual Data</h2>
          <div className={styles.body}>
            <p>{`This is where the data from the currently logged in user can be seen within the day, week, month and year.`}</p>
            <p>{`The individual can find patterns of his/her mood within the individual mood section`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/moodoo-individual.webp"
                alt="Moodoo — individual mood patterns"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Team Data</h2>
          <div className={styles.body}>
            <p>{`Just like the individual data section, this section is specific to the team, so it’s an average of all the individuals (including the currently logged in user) data within the organization.`}</p>
            <p>{`So the team data shows the organization’s health.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/moodoo-team.webp"
                alt="Moodoo — team mood average"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Sharing/Receiving Help</h2>
          <div className={styles.body}>
            <p>{`In Moodoo, we allow mood uplifting, individuals can share resources either as GIFs, Images, Videos, Quotes etc.`}</p>
            <p>{`The idea of how this works is that when an individual (anonymously) is feeling down, team members who are feeling great get notified to help raise the mood of the anonymous fellow in whatever media form that is accepted on the platform which means that if a fellow is feeling high Energy and Pleasant, then they can share resources.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/moodoo-sharing.webp"
                alt="Moodoo — sharing and receiving help"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>In Conclusion</h2>
          <div className={styles.body}>
            <p>{`Currently, Moodoo is still an internal tool for the organization, however, Moodoo at the time of writing will be made public for other organizations soon.`}</p>
          </div>
        </section>

        <Link href="/" className={styles.back}>
          Index
        </Link>
      </div>
    </article>
  );
}
