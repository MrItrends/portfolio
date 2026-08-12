import Link from "next/link";
import styles from "./CaseStudy.module.css";

/**
 * ReliefNow case study. Copy is the author's own, verbatim — do not rewrite.
 * Role and Tools added; all images are placeholders for now.
 */
export default function ReliefNowCaseStudy() {
  return (
    <article className={styles.page}>
      <div className="container">
        <Link href="/" className={styles.back}>
          Index
        </Link>

        <header className={styles.header}>
          <p className={styles.kicker}>Selected Work — 03</p>
          <h1 className={styles.title}>
            Designing ReliefNow: Helping Patients Find Effective, Non-Surgical
            Pain Relief
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
            <p>{`Reliefnow is a healthcare consulting platform for top athletes and highly placed individuals in New York.`}</p>
            <p>{`Patients or prospective patients can book a non-surgical appointment centered around pain relief and can get the best insight from top doctors and physicians into the type of pain they might be dealing with.`}</p>
          </div>
        </header>

        <figure className={`${styles.heroFigure} ${styles.placeholderFill}`}>
          <span>Hero</span>
        </figure>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Homepage</h2>
          <div className={styles.body}>
            <p>{`The idea was to help prospects see a professional medical landing page in the sense that it was not overwhelming but designed simply to help them book quick consultation.`}</p>
            <p>{`From the homepage, they see the type of pain the consultants specialize in, and how they treat the pain, the clients who they’ve treated and their location.`}</p>
            <p>{`So in essence it helps prospects see professionalism and build trust quickly.`}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Other Pages Structure</h2>
          <div className={styles.body}>
            <p>{`Asides the homepage, which was the first point of contact for prospects, the other pages were built to show the type of pain the consultants deal in and also how they treat theirs in their various clinics.`}</p>
            <p>{`So we have pages like:`}</p>
            <ol className={styles.list}>
              <li>Fascia 101</li>
              <li>Relief</li>
              <li>Testimonials</li>
              <li>Conditions</li>
              <li>Longevity</li>
              <li>Doctors</li>
              <li>Locations</li>
              <li>Resources</li>
              <li>FAQs</li>
              <li>Articles</li>
            </ol>
            <p>{`The whole structure provides quick knowledge and also helps the prospects understand that they would get value for their money and time due to the expertise and type of clients that are associated with the clinic.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={`${styles.imgWrap} ${styles.placeholder}`}>
              <span>Pages</span>
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Booking Consultation Form</h2>
          <div className={styles.body}>
            <p>{`Initially we built a three stepper form where users would go through a guided form approach which was dynamic based on their purpose for consultation, however as of today it has been simplified into a smaller form.`}</p>
            <p>{`At the time I worked on the website, the three stepper form was the right idea and it helped collect the right information for users which saved time if they became patients from prospects.`}</p>
            <p>{`By the time they were in the clinic physically, the physician would have had good information about the client and that would speeden the initial phase of communication`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={`${styles.imgWrap} ${styles.placeholder}`}>
              <span>Booking form</span>
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Marketing Pages</h2>
          <div className={styles.body}>
            <p>{`These were the pages used to build social ads, pages like:`}</p>
            <ol className={styles.list}>
              <li>Hip Pain</li>
              <li>Back Pain</li>
              <li>Pain Free Shoulder</li>
            </ol>
            <p>{`And every other pain Relief treats were occasionally used as hooks for ads destination.`}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>In Conclusion</h2>
          <div className={styles.body}>
            <p>{`ReliefNow was made to keep the professional style of top clinics who had a strong social and web presence using a clearly defined brand and visual style.`}</p>
          </div>
        </section>

        <Link href="/" className={styles.back}>
          Index
        </Link>
      </div>
    </article>
  );
}
