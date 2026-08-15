import Link from "next/link";
import Image from "next/image";
import { caseNumber } from "@/lib/projects";
import styles from "./CaseStudy.module.css";

/**
 * Skillspace case study. Copy is the author's own, verbatim — do not rewrite.
 * Role and Tools added; all images are placeholders for now.
 */
export default function SkillspaceCaseStudy() {
  return (
    <article className={styles.page}>
      <div className="container">
        <Link href="/" className={styles.back}>
          Index
        </Link>

        <header className={styles.header}>
          <p className={styles.kicker}>Selected Work — {caseNumber("skillspace")}</p>
          <h1 className={styles.title}>Skillspace.ai</h1>

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
            <p>{`A platform designed for technical hiring managers to efficiently track and manage the recruitment of technical talent, eliminating the need for third-party software.`}</p>
          </div>
        </header>

        <figure className={styles.heroFigure} style={{ aspectRatio: "1512 / 982" }}>
          <Image
            src="/images/skillspace-hero.webp"
            alt="Skillspace — technical hiring platform"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className={styles.heroImg}
          />
        </figure>

        <section className={styles.section}>
          <h2 className={styles.h2}>Problem Statement</h2>
          <div className={styles.body}>
            <p>{`Technical hiring managers often face challenges with existing recruitment platforms, which are either overly complex or focus solely on creating tests, leaving other critical aspects of the hiring process unaddressed. This fragmented approach leads to inefficiencies, increased dependence on multiple tools, and a lack of a seamless workflow for managing the end-to-end recruitment journey.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/skillspace-problem.webp"
                alt="Skillspace — the fragmented hiring problem"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`I began the project from a secondary research, with the need to understand what the hiring process for technical recruiters look like:`}</p>
            <ul className={styles.list}>
              <li>{`How do hiring managers navigate the hiring process for technical roles?`}</li>
              <li>{`What obstacles do they encounter along the way?`}</li>
              <li>{`What’s the typical duration of the hiring cycle? How many platforms must they juggle simultaneously?`}</li>
              <li>{`These inquiries highlight the complexity and challenges inherent in technical hiring practices.`}</li>
            </ul>
            <p>{`unfortunately some of the early processes were not recorded. So here is a sitemap we followed after arriving a solution`}</p>
            <p>{`The sitemap we followed`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/skillspace-sitemap.webp"
                alt="Skillspace — the sitemap we followed"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`Our objective was to design a simple and intuitive solution that enabled recruiters to initiate and manage the entire hiring process within Skillspace, ensuring every aspect of the recruitment cycle was centralized and streamlined.`}</p>
            <p>{`To achieve this, we conducted secondary research by analyzing existing competitors and gathering insights from job applicants’ experiences at Skillspace’s parent company, AI Planet.`}</p>
            <p>{`This research informed our approach as we developed affinity maps to consolidate key observations and ideas, followed by user persona mapping, journey mapping, and design system.`}</p>
            <p>{`After defining the problem and identifying a solution that minimized recruiters’ reliance on multiple tools, we began crafting the design system as the foundation for the platform’s development.`}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Design System</h2>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/skillspace-design-system.webp"
                alt="Skillspace — design system"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>High Fidelity Design</h2>
          <figure className={styles.figure}>
            <div className={styles.imgWrap} style={{ aspectRatio: "1512 / 982" }}>
              <Image
                src="/images/skillspace-highfidelity.webp"
                alt="Skillspace — high fidelity design"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <Link href="/" className={styles.back}>
          Index
        </Link>
      </div>
    </article>
  );
}
