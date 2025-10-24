import React from "react";
import SectionHero from "@/app/[locale]/(server-components)/SectionHero";
import BackgroundSection from "@/components/BackgroundSection";
import SectionGridFeaturePlaces from "@/components/SectionGridFeaturePlaces";
import SectionSubscribe2 from "@/components/SectionSubscribe2";
import SectionMenu from "@/components/SectionMenu";
import SectionBlog from "@/components/SectionBlog";
import SectionClientSay from "@/components/SectionClientSay";

function PageHome() {
  return (
    <main role="main" className="nc-PageHome relative overflow-hidden">
      <SectionHero/>

      <div className="container relative space-y-16 mt-8 mb-16">
        <SectionMenu/>
        <SectionGridFeaturePlaces/>
        <SectionBlog/>
        <SectionSubscribe2 />
        <div className="relative py-16">
          <BackgroundSection />
          <SectionClientSay />
        </div>
      </div>
    </main>
  );
}

export default PageHome;
