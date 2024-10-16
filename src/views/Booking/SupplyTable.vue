<template>
  <div>
    <v-btn prepend-icon="mdi-menu" color="primary" @click="showMenu = true">
      Thêm item
    </v-btn>
    <v-divider></v-divider>
    <!-- Bảng hiển thị các item đã thêm -->
    <v-table>
      <thead>
        <tr>
          <th>Tên item</th>
          <th>Số lượng</th>
          <th>Giá</th>
          <th>Tổng tiền</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in addedItems" :key="item.id">
          <td>{{ item.supply.name }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ formatCurrency(item.price) }} VND</td>
          <td>{{ formatCurrency(item.quantity * item.price) }} VND</td>
        </tr>
      </tbody>
    </v-table>

    <!-- Popup để hiển thị danh sách đồ uống -->
    <v-dialog v-model="showMenu" persistent max-width="600px">
      <v-card>
        <v-card-title class="bg-teal-darken-2 d-flex justify-space-between">
          Danh sách sản phẩm
          <v-btn
            size="small"
            icon
            @click="closeMenu"
            variant="text"
            class="close-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="bg-grey-lighten-4 p-3 m-0">
          <div class="search-bar">
            <v-text-field
              :loading="loadingSearch"
              v-model="search"
              append-inner-icon="mdi-magnify"
              density="compact"
              label="Tìm kiếm"
              variant="solo"
              hide-details
              single-line
            ></v-text-field>
          </div>

          <div class="scrollable-content">
            <v-row>
              <v-col
                v-for="item in filteredItems"
                :key="item.id"
                cols="12"
                md="6"
              >
                <v-card>
                  <v-img :src="item.image" height="150px"></v-img>
                  <v-card-title>{{ item.name }}</v-card-title>
                  <v-card-subtitle>
                    Giá: {{ formatCurrency(item.price) }} VND<br />
                    Tồn kho: {{ item.quantity }}
                  </v-card-subtitle>
                  <v-card-actions>
                    <input
                      style="max-width: 75px"
                      v-model.number="item.tempQuantity"
                      type="number"
                      :max="item.quantity"
                      min="1"
                      class="form-control"
                      aria-label="Sizing example input"
                      aria-describedby="inputGroup-sizing-sm"
                      @change="validateQuantity(item)"
                    />
                    <v-btn
                      color="primary"
                      @click="selectItem(item)"
                      :disabled="item.quantity <= 0"
                      prepend-icon="mdi-cart-plus"
                      variant="outlined"
                    >
                      Thêm
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>

              <v-col v-if="filteredItems.length === 0" cols="12">
                <p class="text-center">Không tìm thấy sản phẩm nào.</p>
              </v-col>
            </v-row>
          </div>

          <v-card class="mb-4" v-if="tempItems.length > 0">
            <v-card-title
              class="d-flex justify-space-between align-center bg-light-blue-lighten-4"
            >
              Các món đã chọn
              <div class="text-subtitle-1">
                Tổng tiền: {{ formatCurrency(calculateTotalAmount()) }} VND
              </div>
            </v-card-title>

            <!-- Bảng tạm hiển thị các item đã chọn -->
            <v-table>
              <thead class="">
                <tr>
                  <th>Tên item</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th>Tổng tiền</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in tempItems" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatCurrency(item.price) }} VND</td>
                  <td>{{ formatCurrency(item.total) }} VND</td>
                  <td>
                    <v-icon
                      left
                      color="red darken-2"
                      @click="removeFromTemp(item)"
                      >mdi-delete</v-icon
                    >
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-card-text>

        <v-card-actions class="bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn color="error" @click="closeMenu">Hủy</v-btn>
          <v-btn
            color="primary"
            @click="confirmItems"
            :disabled="tempItems.length === 0"
          >
            Xác nhận
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, watch } from "vue";
import supplyService from "../../services/supplyService";
import billService from "../../services/billService";

import { showNotification } from "../../utils/notification";

const showMenu = ref(false);
const search = ref("");
const loadingSearch = ref(false);
const items = ref([]);
const tempItems = ref([]);
const addedItems = ref([]);

const props = defineProps({
  bookingId: {
    type: String,
    required: true,
  },
  bill: {
    type: Object,
    required: true,
  },
});

const validateQuantity = (item) => {
  if (item.quantity <= 0) {
    alert("Số lượng vượt quá hàng tồn kho!");
    item.tempQuantity = item.quantity;
  } else if (item.tempQuantity < 1) {
    alert("Số lượng phải lớn hơn hoặc bằng 1!");
    item.tempQuantity = 1;
  }
};

const selectItem = (item) => {
  const existingItem = tempItems.value.find((i) => i.id === item.id);

  if (existingItem) {
    console.log(existingItem.quantity, item.tempQuantity, item.quantity);

    if (item.quantity <= 0) {
      item.tempQuantity = 0;
      alert("Số lượng vượt quá hàng tồn kho!");
      return;
    }
    existingItem.quantity += item.tempQuantity;
    existingItem.total = existingItem.quantity * Number(existingItem.price);
  } else {
    const tempItem = {
      ...item,
      quantity: item.tempQuantity,
      total: item.tempQuantity * Number(item.price),
    };
    tempItems.value.push(tempItem);
  }

  item.quantity -= item.tempQuantity;

  item.tempQuantity = 1;
};

const removeFromTemp = (item) => {
  const originalItem = items.value.find((i) => i.id === item.id);

  if (originalItem) {
    originalItem.quantity += item.quantity;
  }

  tempItems.value = tempItems.value.filter((i) => i !== item);
};

const removeFromMainTable = (item) => {
  const originalItem = items.value.find((i) => i.id === item.id);

  if (originalItem) {
    originalItem.quantity += item.quantity;
  }

  addedItems.value = addedItems.value.filter((i) => i !== item);
};

const confirmItems = async () => {
  console.log(tempItems.value);

  try {
    const response = await billService.addItems(props.bill.id, tempItems.value);

    const rp = await billService.getBillSupplies(props.bill.id);

    addedItems.value = rp.data;

    console.log(response.data);

    showNotification({
      title: "Thông báo",
      message: response.data.message, 
      type: "success",
    });

    closeMenu();
  } catch (error) {
    console.error("Có lỗi xảy ra khi thêm sản phẩm:", error);
  }
};

const calculateTotalAmount = () => {
  return tempItems.value.reduce((sum, item) => sum + item.total, 0);
};

const closeMenu = () => {
  fetchSupplies();
  showMenu.value = false;
  tempItems.value = [];
};

const formatCurrency = (amount) => {
  return parseFloat(amount)
    .toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    })
    .replace("₫", "");
};

const fetchSupplies = async () => {
  try {
    loadingSearch.value = true;
    const response = await supplyService.getSupplies();
    items.value = response.data;
    items.value.forEach((item) => (item.tempQuantity = 1));
  } finally {
    loadingSearch.value = false;
  }
};

const filteredItems = computed(() => {
  return search.value
    ? items.value.filter((item) =>
        item.name.toLowerCase().includes(search.value.toLowerCase())
      )
    : items.value;
});

watch(showMenu, (newValue) => {
  if (newValue) {
    fetchSupplies();
  }
});

onMounted(() => {
  addedItems.value = props.bill.supplies;
  console.log(props.bill.supplies);
});
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}
.scrollable-content {
  height: 1000px;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
