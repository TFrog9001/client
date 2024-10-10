<template>
  <div class="d-flex flex-column min-h-screen">
    <!-- Hero Section -->
    <div class="position-relative">
      <!-- Carousel background -->
      <v-carousel hide-delimiters :showArrows="false" :cycle="true" :interval="6000">
        <v-carousel-item v-for="(slide, i) in slides" :key="i">
          <div
            :style="`background-image: url(${slide}); background-size: cover; background-position: center; height: 100%;`"
            class="v-carousel-item__background"
          ></div>
        </v-carousel-item>
      </v-carousel>

      <!-- Content over the background -->
      <div class="content-overlay py-12 py-md-24 py-lg-32 text-center">
        <v-row class="justify-center">
          <v-col cols="12">
            <h1 class="display-1 font-weight-bold">
              Book Your Perfect Soccer Field
            </h1>
            <p class="mx-auto text-gray-500">
              Find and reserve the best soccer fields in your area. Easy
              booking, great prices, and top-notch facilities.
            </p>
            <v-btn color="primary" class="me-4" to="/booking">Book Now</v-btn>
            <v-btn text color="infor">View Fields</v-btn>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Why Choose Us Section -->
    <v-container class="py-12 py-md-24 py-lg-32 bg-white">
      <h2 class="display-2 text-center mb-12">Why Choose Us</h2>
      <v-row>
        <v-col
          v-for="(item, index) in features"
          :key="index"
          class="text-center"
        >
          <v-icon size="40">{{ item.icon }}</v-icon>
          <h3 class="font-weight-bold">{{ item.title }}</h3>
          <p class="text-sm text-gray-500">{{ item.description }}</p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Our Fields Section -->
    <v-container class="py-12 py-md-24 py-lg-32 bg-grey-lighten-3">
      <h2 class="display-2 text-center mb-12">Our Fields</h2>
      <v-row>
        <v-col v-for="(field, index) in fields" :key="index" md="4">
          <v-img
            :src="field.image"
            :alt="field.name"
            class="rounded-lg shadow-lg"
          >
            <div class="absolute inset-0 bg-black bg-opacity-50"></div>
            <div class="absolute inset-0 d-flex align-center justify-center">
              <h3 class="text-black">{{ field.name }}</h3>
            </div>
          </v-img>
        </v-col>
      </v-row>
    </v-container>

    <!-- Call to Action Section -->
    <v-container
      class="py-12 py-md-24 py-lg-32 bg-teal-darken-2 text-white text-center"
    >
      <h2 class="display-2">Ready to Play?</h2>

      <v-col class="text-center">
        <v-btn color="secondary">Register Now</v-btn>
      </v-col>

      <p class="text-xs text-green-100">
        By booking, you agree to our terms and conditions.
      </p>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from "vue";
import fieldService from "../services/fieldService";

// Data for features section
const features = ref([
  {
    icon: "mdi-clock",
    title: "Easy Booking",
    description: "Book your field in minutes, anytime, anywhere.",
  },
  {
    icon: "mdi-map-marker",
    title: "Prime Locations",
    description: "Access to the best fields in your area.",
  },
  {
    icon: "mdi-shield",
    title: "Secure Payments",
    description: "Safe and secure online transactions.",
  },
]);

// Data for fields section
const fields = ref([
  { name: "Downtown Field", image: "/placeholder.svg" },
  { name: "Riverside Arena", image: "/placeholder.svg" },
  { name: "Sunset Park", image: "/placeholder.svg" },
]);

import slide1 from "../assets/images/sb1.jpg";
import slide2 from "../assets/images/sb2.jpeg";
import slide3 from "../assets/images/sb3.jpg";
const slides = [slide1, slide2, slide3];
</script>

<style scoped>
.v-icon {
  color: green;
}

.v-img {
  position: relative;
  overflow: hidden;
}

.v-img:hover .absolute {
  opacity: 1;
}

.absolute {
  transition: opacity 0.3s ease-in-out;
  opacity: 0;
}

.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.position-relative {
  position: relative;
}

.content-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
</style>
