import Link from "next/link";
import { caseNumber } from "@/lib/projects";
import styles from "./CaseStudy.module.css";

/**
 * Anybuy case study. Copy is the author's own, verbatim — do not rewrite.
 * Role and Tools added; all images are placeholders for now.
 */
export default function AnybuyCaseStudy() {
  return (
    <article className={styles.page}>
      <div className="container">
        <Link href="/" className={styles.back}>
          Index
        </Link>

        <header className={styles.header}>
          <p className={styles.kicker}>Selected Work — {caseNumber("anybuy")}</p>
          <h1 className={styles.title}>
            Built with Claude, rethinking how pre-loved products are sold
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
            <p>{`Anybuy is a platform for selling pre-loved items, the idea isn’t novel but the aim was to resolve the concept of ‘what you buy isn’t what you get’ and also to ease the problem most users face, not getting overwhelmed with a lot of choice.`}</p>
          </div>
        </header>

        <figure className={`${styles.heroFigure} ${styles.placeholderFill}`}>
          <span>Hero</span>
        </figure>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Problem</h2>
          <div className={styles.body}>
            <p>{`Platforms where pre-loved items are solved usually look very disorganized, especially in Africa and I understand that the platform owners would love sellers to populate the platform with as many items or products as possible, most times, it creates a traumatic experience for the buyers because it creates an analysis paralysis syndrome for the buyers or leaves them spending before what they would have loved to spend.`}</p>
            <p>{`When they shop, they get lost in the concept of choice, what they came for vs when and how they checkout.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={`${styles.imgWrap} ${styles.placeholder}`}>
              <span>Analysis paralysis</span>
            </div>
          </figure>
          <div className={styles.body}>
            <p>{`Also, buyers usually complain about not getting the right order that was advertised on the platform which usually deters them from returning to it or becoming life long customers.`}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>{`Solving the ‘what you get vs what you ordered problem’`}</h2>
          <div className={styles.body}>
            <p>{`Firstly, the aim was to ensure that there would be a middle ground for both buyers and sellers. Think about it as what will make both the sellers and buyers happy to trade with each other.`}</p>
            <p>{`I thought of creating a system where the sellers do not get credited immediately when a purchase is made, rather the money is held in an escrow and only gets released when the rider has confirmed the release of the product to the buyer.`}</p>
            <p>{`To confirm release both exchange a pin that’s issued to the buyer after checkout and the rider when the item has been sent to them.`}</p>
            <p>{`For both the seller and rider to get their money, they need to update the status which is what the system uses to know if either should get paid or not.`}</p>
          </div>
          <figure className={styles.figure}>
            <div className={`${styles.imgWrap} ${styles.placeholder}`}>
              <span>Escrow flow</span>
            </div>
          </figure>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>{`Solving the ‘Purchase Paralysis Problem’`}</h2>
          <div className={styles.body}>
            <p>{`To solve this problem, so use clearly distinguishable title/categories for items/products that allow users to know what section they should browse and also we intend to use a smart search approach where users can tell it all they want to do without scrolling around the page and it will add all the items into the cart and redirect the users there.`}</p>
            <p>{`However, regular users can still scroll and search like existing patterns of most e-commerce platforms.`}</p>
            <p>{`So far, the distinguishable headers do not show so many products at once but a limited number with a see all button to allow users to visit that specific category and search a broader list of that category rather than all categories.`}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>The Nice-to-Have Auction Feature</h2>
          <div className={styles.body}>
            <p>{`Added an auction feature where sellers can auction their items on the platform, the idea is to allow user create buzz for specific products they might want to sell off either for a lower or higher price.`}</p>
            <p>{`We allow them to set a starting bidding price and an ending price based on if the auction will be closed on price, or if its a set time.`}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>Conclusion</h2>
          <div className={styles.body}>
            <p>{`The idea of anybuy is to allow sellers to easily sell their items but the platform ensures theres a high level of trust an assurance to the buyers`}</p>
          </div>
        </section>

        <Link href="/" className={styles.back}>
          Index
        </Link>
      </div>
    </article>
  );
}
