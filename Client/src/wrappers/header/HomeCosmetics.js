import React, { Fragment } from "react";

import LayoutOne from "../../layouts/LayoutOne";

import HeroSliderOne from "./HeroSliderOne";
import DiscountOfferSection from "../../wrappers/discount/DiscountOfferSection";
import SareeCarouselSection from "./SareeCarouselSection";
import PromoOfferBanner from "./PromoOfferBanner";
import ShopByCollections from "./ShopByCollections";
import EmartebuyBanners from "./EmartebuyBanners ";
import NewArrivals from "./Newarrivals";
import BestSellers from "./Bestsellers";
import InstagramSection from "./InstagramSection";

const HomeCosmetics = ({ shop }) => {
  return (
    <Fragment>
   
      <LayoutOne
        shop={shop}
        headerContainerClass="container-fluid"
        headerPaddingClass="header-padding-2"
      >
        <HeroSliderOne />
        <ShopByCollections spaceTopClass="pt-60" spaceBottomClass="pb-60" />
        <PromoOfferBanner position="new_arrivals" />
        <NewArrivals shop={shop} />
        
        <PromoOfferBanner position="best_sellers" />
        <BestSellers shop={shop} />
   
        <SareeCarouselSection
          spaceTopClass="pt-70"
          spaceBottomClass="pb-50"
          sectionTitle="What More Live"
        />
              <EmartebuyBanners spaceTopClass="pt-60" spaceBottomClass="pb-60" />
        <InstagramSection />
       
      </LayoutOne>
    </Fragment>
  );
};

export default HomeCosmetics;