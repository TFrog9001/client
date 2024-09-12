<script setup>
import { ref, watchEffect, defineProps } from "vue";

// Nhận prop từ component cha
const props = defineProps({
  prices: Array, // Định nghĩa kiểu dữ liệu của props
});

const startDay = 5;
const endDay = 24;
const hourHeight = 60;

// Tạo các div hiển thị giá dựa trên thời gian
const generatePriceElements = () => {
  return props.prices.map((p) => {
    const [startTime, startMinute] = p.start_time.split(":").map(Number);
    const [endTime, endMinute] = p.end_time.split(":").map(Number);

    const height =
      (endTime + endMinute / 60 - (startTime + startMinute / 60)) * hourHeight;
    const topPosition =
      (startTime - startDay + startMinute / 60) * hourHeight + hourHeight / 2;

    return {
      id: p.id,
      top: topPosition,
      height: height,
      price: p.price,
      timeRange: `${p.start_time} - ${p.end_time}`,
    };
  });
};

const priceElements = ref([]);

watchEffect(() => {
  priceElements.value = generatePriceElements();
});
</script>

<template>
  <div class="calendar-container">
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Sân 1</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="hour in endDay - startDay - 1" :key="hour">
          <tr>
            <td style="text-align: center; font-weight: 450" rowspan="2">
              {{ startDay + hour }}:00
            </td>
            <td></td>
          </tr>
          <tr>
            <td></td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Hiển thị các div chứa giá -->
    <div
      v-for="element in priceElements"
      :key="element.id"
      :style="{
        padding: '10px',
        position: 'absolute',
        width: '200px',
        height: element.height + 'px',
        backgroundColor: 'rgba(100, 181, 246)',
        left: '200px',
        top: element.top + 'px',
      }"
    >
      {{ element.timeRange }}
      <br />
      {{ element.price }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
table {
  width: 400px;
  border-collapse: collapse;

  tr {
    height: 30px;

    th {
      width: 100px;
      border: 1px solid;
    }

    td {
      border: 1px solid;
    }
  }
}

.calendar-container {
  position: relative;
}
</style>
