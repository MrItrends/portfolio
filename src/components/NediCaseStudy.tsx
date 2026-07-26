import Link from "next/link";
import Image from "next/image";
import styles from "./NediCaseStudy.module.css";

/**
 * NEDI case study. Copy is the author's own, verbatim — do not rewrite.
 * Only the Role and Tools metadata are added on top of the source content.
 */
export default function NediCaseStudy() {
  return (
    <article className={styles.page}>
      <div className="container">
        <Link href="/" className={styles.back}>
          Index
        </Link>

        <header className={styles.header}>
          <p className={styles.kicker}>Selected Work — 05</p>
          <h1 className={styles.title}>
            Designing the Minimum Viable Product for the Nigerian EDTECH
            Platform
          </h1>

          <dl className={styles.meta}>
            <div className={styles.metaItem}>
              <dt>Role</dt>
              <dd>Product Designer — MVP</dd>
            </div>
            <div className={styles.metaItem}>
              <dt>Tools</dt>
              <dd>Figma</dd>
            </div>
          </dl>

          <div className={styles.lead}>
            <p>
              The Nigerian Edtech portal (NEDI) is a unified, national education
              data intelligence platform that serves as the single source of
              truth for Nigeria&rsquo;s education ecosystem.
            </p>
            <p>
              The aim for NEDI-X is to allow the collection, analyzing and
              visualization of data across the entire education value chain
              (from early years to tertiary).
            </p>
          </div>
        </header>

        <figure className={styles.heroFigure}>
          <Image
            src="/images/herofornedi.gif"
            alt="NEDI platform hero"
            fill
            unoptimized
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className={styles.heroImg}
          />
        </figure>

        <section className={styles.section}>
          <h2 className={styles.h2}>Onboarding for multiple users and to save time</h2>
          <div className={styles.body}>
            <p>
              Unlike most onboarding which needed to be made quite detailed and
              sometimes &lsquo;overengineered&rsquo; NEDI was quite specific, it
              was for the Government.
            </p>
            <p>
              Designing for the government means that you don&rsquo;t have to
              struggle for data or users so all you need to do is design for most
              middle aged and older adults which entails clarity and simplicity.
            </p>
            <p>NEDI needed to capture these user type:</p>
            <ol className={styles.list}>
              <li>Government Official</li>
              <li>School Administrator</li>
              <li>Edtech Company</li>
              <li>Donor/Partner</li>
              <li>Research/Analyst</li>
              <li>EMIS/UBEC/NEDI Official</li>
            </ol>
          </div>

          <figure className={styles.figure}>
            <div className={styles.imgWrap}>
              <Image
                src="/images/nedi-onboarding.png"
                alt="NEDI onboarding — choose your access path"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>

          <div className={styles.body}>
            <p>Which meant that we were building a dynamic system for multiple users.</p>
            <p>
              The goal was simply to ask the usertype at the start of onboarding,
              how they wanted to access NEDI and allow them choose their path
              which would then take them to their respective dashboard.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>
            The Government Official/EMIS, UBEC and NEDI Officials Dashboard
          </h2>
          <div className={styles.body}>
            <p>
              The dashboard for these officials, the core of the government, was
              clearly to show data across different parastatals.
            </p>
            <p>
              Since I had an incomplete information about the type of data to be
              shown, it prompted me to research and concluded with the following
              data:
            </p>
            <ol className={styles.list}>
              <li>Student Data</li>
              <li>Teacher Data</li>
              <li>School Registry Data</li>
              <li>Attendance Data (Student and Teacher)</li>
              <li>Test and Exam Results</li>
              <li>Infrastructure Data</li>
              <li>Finance Data</li>
              <li>Incident Reporting Data</li>
              <li>
                Other Insights that could be useful to help the Government both
                stay informed in the educational sector and also help make
                concrete decisions around it.
              </li>
            </ol>
          </div>

          <figure className={styles.figure}>
            <div className={styles.imgWrap}>
              <Image
                src="/images/nedi-dashboard.png"
                alt="NEDI officials dashboard"
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className={styles.img}
              />
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>AI Sandbox</h2>
          <div className={styles.body}>
            <p>
              The AI sandbox is more like a generative feature on NEDI where an
              official can go and ask questions about the educational system in
              Nigeria and based on accumulated data from edtech and since we have
              captured data from TVET, the Edtech Portal etc, the Sandbox can go
              through that data and give whatever insight needed to the official.
            </p>
          </div>

          <figure className={styles.figure}>
            <div className={`${styles.imgWrap} ${styles.placeholder}`}>
              <span>AI Sandbox</span>
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Edtech Portal</h2>
          <div className={styles.body}>
            <p>
              The Edtech Portal is for every school administrator to manage their
              individual schools which helps provide data to the top level NEDI.
              In there, schools can manage partnerships, build an active community
              and even access the AI sandbox as well
            </p>
          </div>

          <figure className={styles.figure}>
            <div className={`${styles.imgWrap} ${styles.placeholder}`}>
              <span>Edtech Portal</span>
            </div>
          </figure>

          <div className={styles.body}>
            <p>
              The difference between the edtech portal accessed by schools and the
              portal accessed by edtech companies is that edtech companies
              directly see the list of schools that have onboarded on the edtech
              portal and they can decide to build a partnership with the school by
              scheduling meetings and having conversations that lead to a
              partnership close out.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>In Conclusion</h2>
          <div className={styles.body}>
            <p>
              NEDI was an MVP which got presented to the vice president of
              Nigeria. My role was to deliver the design and this was a one-time
              project and as at the time of writing this case study, the project
              still lies at the desk of the Federal Government with fingers
              crossed it would be taken further ahead.
            </p>
          </div>
        </section>

        <Link href="/" className={styles.back}>
          Index
        </Link>
      </div>
    </article>
  );
}
