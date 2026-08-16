import Link from "next/link";
import Image from "next/image";
import { caseNumber } from "@/lib/projects";
import styles from "./CaseStudy.module.css";

/**
 * RoboLearn case study. Copy is the author's own, verbatim — do not rewrite.
 * Role and Tools added; all images are placeholders for now.
 */
export default function RoboLearnCaseStudy() {
  return (
    <article className={styles.page}>
      <div className="container">
        <Link href="/" className={styles.back}>
          Home
        </Link>

        <header className={styles.header}>
          <p className={styles.kicker}>Selected Work — {caseNumber("robolearn")}</p>
          <h1 className={styles.title}>
            Designing an Interactive Robotics Learning Platform for Young
            Innovators
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
            <p>{`Robolearn is a platform for kids and teenagers who are interested in learning Robotics on their own.`}</p>
            <p>{`The platform provides a guided approach to allow kids to get the basics of robotics and try out simulated challenges through modules and daily challenges.`}</p>
          </div>

          <a
            className={styles.visit}
            href="https://robolearn.nigenius.ng/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit site
          </a>
        </header>

        <figure className={styles.heroFigure} style={{ aspectRatio: "1512 / 982" }}>
          <Image
            src="/images/robolearn-hero.webp"
            alt="RoboLearn — robotics learning platform"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className={styles.heroImg}
          />
        </figure>

        <section className={styles.section}>
          <h2 className={styles.h2}>Learning through Modules</h2>
          <div className={styles.body}>
            <p>{`When the brief came in, it was quite clear what needed to be done, to design a platform that allowed kids/teenagers to take classes, quizzes and projects that would ensure they got the fundamentals of robotics.`}</p>
            <p>{`Modules were designed to allow for the progressive learning of the kids, we started from Module 1 and progressed to Module 5 and beyond.`}</p>
            <p>{`Modules have lessons, quizzes, activities and projects. Completing a module allows the kid to unlock a module badge`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/robolearn-modules.webp"
                alt="RoboLearn — learning through modules"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Learning through Recommended Lessons</h2>
          <div className={styles.body}>
            <p>{`Based on the user, there are recommended lessons to help the learner with a continuous way to learn on the platform. It provides them an optional way to expand the knowledge gotten from completing their modules`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/robolearn-recommended.webp"
                alt="RoboLearn — recommended lessons"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Learning through Daily Challenges</h2>
          <div className={styles.body}>
            <p>{`Unlike modules, daily challenges allow the kids to attempt projects that are different from the projects found in the module. Learnings find new projects daily to try out which ensures that they have something new to try out on daily.`}</p>
            <p>{`Modules are limited and can be completed without new modules but daily challenges are available on a daily basis.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/robolearn-daily.webp"
                alt="RoboLearn — daily challenges"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Virtual Builder</h2>
          <div className={styles.body}>
            <p>{`The virtual builder is where students attempt to carry out robotics projects, students drag components to the canvas and based on information, are directed on how to connect the components and when done, how to build the components in code and the run to see the simulation.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <video className={styles.heroVideo} autoPlay muted loop playsInline>
                <source src="/media/virtualbuilder.mp4" type="video/mp4" />
              </video>
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Davinci AI Assistant</h2>
          <div className={styles.body}>
            <p>{`Learners get to ask questions anytime they feel stuck on the platform, asides the AI assisted voice that guides the learner through the platform, modules activity etc. Davinci is the ai bot, the student can interact with to get insight into whatever they want to ask about robolearn.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 1280" }}>
              <Image
                src="/images/robolearn-davinci.webp"
                alt="RoboLearn — Davinci AI assistant"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Gamification of the Platform</h2>
          <div className={styles.body}>
            <p>{`Knowing kids and teenagers are very aware, ‘have an appetite for excitement’, I decided to make the experience feel like a game. From the button mirroring a 3D style, adding a click sound to the button to feel like playing a game, making the avatar talk and move around, adding paper confetti for high scoring quizzes, assignment/project completion and also allowing the students unlock badges for completed modules and Quizzes.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 900" }}>
              <Image
                src="/images/robolearn-gamification.webp"
                alt="RoboLearn — gamification and badges"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Community</h2>
          <div className={styles.body}>
            <p>{`While learning, users can compare their learning with other learners through the community page.`}</p>
            <p>{`There’s a leaderboard to show all learner progress across the day, week, month and year.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 900" }}>
              <Image
                src="/images/robolearn-community.webp"
                alt="RoboLearn — the community and leaderboard"
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
            <p>{`Robolearn allows kids to have a guided approach of learning by themselves.`}</p>
          </div>
        </section>

        <Link href="/" className={styles.back}>
          Home
        </Link>
      </div>
    </article>
  );
}
