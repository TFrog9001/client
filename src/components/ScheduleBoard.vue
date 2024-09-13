<template>
  <v-card>
    <v-card-title>Schedule Board</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <div class="schedule-board">
        <div class="time-line" v-for="n in 18">
          {{ n + 5 }}:00
          <br />
          |
        </div>
      </div>
      <div class="schedule-board">
        <div
          class="time-slot"
          v-for="(price, index) in prices"
          :key="price.id"
          :style="getTimeSlotStyle(price, index)"
        >
          <span>{{ price.price }} VND</span>
          <br />
          <span>{{ price.start_time }} - {{ price.end_time }}</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  prices: Array,
});
const colorPalette = ["blue", "green", "orange", "purple", "yellow", "teal"];

const getTimeSlotStyle = (timeSlot, index) => {
  const startHour = parseInt(timeSlot.start_time.split(":")[0]);
  const endHour = parseInt(timeSlot.end_time.split(":")[0]);
  const startGridColumn = startHour - 6 + 1;
  const endGridColumn = endHour - 6 + 1;
  const backgroundColor = colorPalette[index % colorPalette.length];

  return {
    gridColumn: `${startGridColumn} / ${endGridColumn}`,
    backgroundColor: backgroundColor,
    color: "white",
    textAlign: "center",
    padding: "5px",
    borderRadius: "5px",
  };
};
</script>

<style scoped>
.schedule-board {
  display: grid;
  grid-template-columns: repeat(18, 1fr);
  grid-gap: 5px;
}

.time-slot {
  height: 50px;
  display: block;
  font-size: 14px;
  color: white;
}

.time-line {
  display: block;
  font-size: 14px;
}
</style>
