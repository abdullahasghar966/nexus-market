import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { Categories } from "@/components/home/Categories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { VendorSpotlight } from "@/components/home/VendorSpotlight";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Categories />
      <FeaturedProducts />
      <VendorSpotlight />
      <Testimonials />
      <Newsletter />
    </>
  );
}
