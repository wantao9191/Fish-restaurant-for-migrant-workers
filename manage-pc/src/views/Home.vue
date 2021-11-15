<template>
  <div class="home">
    <!-- <el-table :row-class-name="tableRowClassName" :span-method="arraySpanMethod" :data="tableData" style="width: 100%" align="center">
      <el-table-column label="课程表" align="center">
        <el-table-column label="星期" align="center">
          <template v-slot="scope"> <div class="table-label">
              <span v-for="(l,i) in scope.row.label" :key="i">
                  {{l}}
              </span>
          </div>
        </el-table-column>
        <el-table-column label="一" align="center">
          <template v-slot="scope">{{ scope.row.classes[0] }}</template>
        </el-table-column>
        <el-table-column label="二" align="center">
          <template v-slot="scope">{{ scope.row.classes[1] }}</template>
        </el-table-column>
        <el-table-column label="三" align="center">
          <template v-slot="scope">{{ scope.row.classes[2] }}</template>
        </el-table-column>
        <el-table-column label="四" align="center">
          <template v-slot="scope">{{ scope.row.classes[3] }}</template>
        </el-table-column>
        <el-table-column label="五" align="center">
          <template v-slot="scope">{{ scope.row.classes[4] }}</template>
        </el-table-column>
      </el-table-column>
    </el-table>
    <el-table :row-class-name="tableRowClassName" :span-method="arraySpanMethod" :data="tableData" style="width: 100%" align="center">
      <el-table-column label="课程表" align="center">
        <el-table-column label="星期" align="center">
          <template v-slot="scope"> <div class="table-label">
              <span v-for="(l,i) in scope.row.label" :key="i">
                  {{l}}
              </span>
          </div>
        </el-table-column>
        <el-table-column label="一" align="center">
          <template v-slot="scope">{{ scope.row.classes[0] }}</template>
        </el-table-column>
        <el-table-column label="二" align="center">
          <template v-slot="scope">{{ scope.row.classes[1] }}</template>
        </el-table-column>
        <el-table-column label="三" align="center">
          <template v-slot="scope">{{ scope.row.classes[2] }}</template>
        </el-table-column>
        <el-table-column label="四" align="center">
          <template v-slot="scope">{{ scope.row.classes[3] }}</template>
        </el-table-column>
        <el-table-column label="五" align="center">
          <template v-slot="scope">{{ scope.row.classes[4] }}</template>
        </el-table-column>
      </el-table-column>
    </el-table> -->

    <!-- <img src="../assets/imgs/1.jpg" alt="">
  <img src="../assets/imgs/2.jpg" alt="">
  <img src="../assets/imgs/3.jpg" alt="">
  <img src="../assets/imgs/4.jpg" alt="">
  <img src="../assets/imgs/5.jpg" alt=""> -->
    <!-- <img src="../assets/imgs/6.jpeg" alt=""><img src="../assets/imgs/7.jpeg" alt=""><img width="800" src="../assets/imgs/8.jpeg" alt=""> -->
    <el-table
      :data="tableData"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="label" label="公司" width="180"> </el-table-column>
      <el-table-column prop="name" label="操作" width="180"> </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { reactive } from "vue";
export default {
  setup() {
    const tableData = reactive([
      {
        label: "南京港",
        id:1,
        children:[{label:'11'}]
      },

      {
        label: "苏州岗",
        id:2
      },
      {
        label: "镇江港",
        id:3
      },
      {
        label: "泰州港",
        id:4
      },
      {
        label: "扬州港",
        id:5
      },
    ]);
    const arraySpanMethod = ({ row, column, rowIndex, columnIndex }) => {
      let hasVal = row.classes.filter((c) => {
        return c;
      });
      if (!hasVal.length) {
        return [1, 6];
      }
    };
    const tableRowClassName = ({ row, rowIndex }) => {
      console.log(row);
      return row.className;
    };
    return { tableData, arraySpanMethod, tableRowClassName };
  },
};
</script>
<style lang="scss" scoped>
.home {
  width: 800px;
  margin: 10px auto;
  .table-label {
    display: flex;
    justify-content: center;
    span {
      padding: 0 100px;
    }
  }
}
</style>
<style lang="scss" >
.home {
  .el-table {
    margin-bottom: 20px;
    .warning-row {
      --el-table-tr-background-color: var(--el-color-warning-lighter);
    }
    .success-row {
      --el-table-tr-background-color: var(--el-color-success-lighter);
    }
  }
}
</style>