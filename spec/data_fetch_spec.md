# 股票数据取数规范 (Data Fetch Specification)

> 版本: v1.0  
> 创建日期: 2026-07-02  
> 状态: 已确认  

---

## 1. 目标概述

本规范定义了通过 Tushare MCP 接口获取 A 股股票全量标准化数据的完整流程，覆盖行情、基本面和财务报表三大类数据。适用于量化分析、回测研究等场景。

### 1.1 目标股票池

| 股票名称 | Tushare 代码 | 交易所 | 板块 | 行业 | 代表性 |
|---------|-------------|--------|------|------|--------|
| 中芯国际 | 688981.SH | SSE | 科创板 | 半导体 | 硬科技/成长型 |
| 比亚迪   | 002594.SZ  | SZSE | 主板  | 新能源汽车 | 制造业/龙头 |
| 长江电力 | 600900.SH  | SSE | 主板  | 电力 | 公用事业/价值型 |

### 1.2 数据范围

- **时间范围**: 各股票上市首日至最新可用数据
- **数据粒度**:
  - 行情类: 日频 (daily)
  - 基本面类: 日频 (daily_basic)
  - 财务类: 季度/年度报告期

### 1.3 输出格式

- 格式: CSV (UTF-8 编码, 含表头)
- 命名规范: `{数据类型}.csv`
- 存储路径: `data/{交易所}_{代码}/`

---

## 2. 目录结构

```
TASK2/
├── data/                          # 数据存储根目录
│   ├── SSE_688981/               # 中芯国际
│   │   ├── stock_basic.csv       # 股票基本信息
│   │   ├── daily.csv             # 日线行情
│   │   ├── adj_factor.csv        # 复权因子
│   │   ├── daily_basic.csv       # 每日基本面指标
│   │   ├── income.csv            # 利润表
│   │   ├── balancesheet.csv     # 资产负债表
│   │   ├── cashflow.csv          # 现金流量表
│   │   └── fina_indicator.csv    # 财务指标
│   ├── SZSE_002594/              # 比亚迪
│   │   └── (同上结构)
│   └── SSE_600900/               # 长江电力
│       └── (同上结构)
├── config/
│   └── stock_list.yaml           # 股票池配置文件
└── spec/
    └── data_fetch_spec.md        # 本规范文件
```

---

## 3. 股票池配置文件 (stock_list.yaml)

```yaml
# 股票池配置
# 格式: 数据取数时按此列表遍历执行

stocks:
  - name: 中芯国际
    ts_code: 688981.SH
    exchange: SSE
    industry: 半导体

  - name: 比亚迪
    ts_code: 002594.SZ
    exchange: SZSE
    industry: 新能源汽车

  - name: 长江电力
    ts_code: 600900.SH
    exchange: SSE
    industry: 电力

# 取数参数全局配置
global_config:
  output_format: csv
  encoding: utf-8
  data_root: ./data
```

---

## 4. 数据模块详细规范

### 4.1 股票基本信息

| 项目 | 说明 |
|------|------|
| Tushare 接口 | `stock_basic` |
| 输出文件 | `stock_basic.csv` |
| 取数频率 | 一次性获取，按需更新 |
| 必填参数 | `ts_code` |
| 可选参数 | `fields` |

**请求参数:**

```yaml
api: stock_basic
params:
  ts_code: "{ts_code}"       # 从配置中读取
  list_status: "L"           # 仅上市状态
  fields:                    # 指定返回字段
    - ts_code
    - symbol
    - name
    - area
    - industry
    - market
    - list_date
    - act_name
    - fullname
    - exchange
    - is_hs
```

**输出字段:**

| 字段 | 含义 | 示例 |
|------|------|------|
| ts_code | 股票代码 | 688981.SH |
| symbol | 代码后缀 | 688981 |
| name | 股票名称 | 中芯国际 |
| area | 地域 | 上海 |
| industry | 行业 | 半导体 |
| market | 市场 | 科创板 |
| list_date | 上市日期 | 20200716 |
| act_name | 实控人名称 | - |
| fullname | 全称 | 中芯国际集成电路制造有限公司 |
| exchange | 交易所代码 | SSE |
| is_hs | 沪深港通 | N |

---

### 4.2 日线行情

| 项目 | 说明 |
|------|------|
| Tushare 接口 | `daily` |
| 输出文件 | `daily.csv` |
| 取数频率 | 每日更新 |
| 必填参数 | 无 (通过 ts_code + start_date 筛选) |
| 日期范围 | 上市首日至今 |

**请求参数:**

```yaml
api: daily
params:
  ts_code: "{ts_code}"
  start_date: "{list_date}"   # 从 stock_basic 获取
  end_date: ""                 # 空=最新
```

**输出字段:**

| 字段 | 含义 | 类型 |
|------|------|------|
| ts_code | 股票代码 | string |
| trade_date | 交易日期 | string (YYYYMMDD) |
| open | 开盘价 | float |
| high | 最高价 | float |
| low | 最低价 | float |
| close | 收盘价 | float |
| pre_close | 前收盘价 | float |
| change | 涨跌额 | float |
| pct_chg | 涨跌幅(%) | float |
| vol | 成交量(手) | float |
| amount | 成交额(千元) | float |

---

### 4.3 复权因子

| 项目 | 说明 |
|------|------|
| Tushare 接口 | `adj_factor` |
| 输出文件 | `adj_factor.csv` |
| 取数频率 | 每日更新 |
| 必填参数 | 无 (通过 ts_code 筛选) |

**请求参数:**

```yaml
api: adj_factor
params:
  ts_code: "{ts_code}"
  start_date: "{list_date}"
```

**输出字段:**

| 字段 | 含义 | 类型 |
|------|------|------|
| ts_code | 股票代码 | string |
| trade_date | 交易日期 | string |
| adj_factor | 复权因子 | float |

---

### 4.4 每日基本面指标

| 项目 | 说明 |
|------|------|
| Tushare 接口 | `daily_basic` |
| 输出文件 | `daily_basic.csv` |
| 取数频率 | 每日更新 |
| 必填参数 | `ts_code` |
| 注意事项 | 单次最大返回 6000 条 |

**请求参数:**

```yaml
api: daily_basic
params:
  ts_code: "{ts_code}"
  start_date: "{list_date}"
```

**输出字段:**

| 字段 | 含义 | 类型 |
|------|------|------|
| ts_code | 股票代码 | string |
| trade_date | 交易日期 | string |
| close | 当日收盘价 | float |
| turnover_rate | 换手率(%) | float |
| turnover_rate_f | 换手率(自由流通股)(%) | float |
| volume_ratio | 量比 | float |
| pe | 市盈率(总市值/净利润,亏损为空) | float |
| pe_ttm | 市盈率(TTM) | float |
| pb | 市净率 | float |
| ps | 市销率 | float |
| ps_ttm | 市销率(TTM) | float |
| dv_ratio | 股息率(%) | float |
| dv_ttm | 股息率(TTM)(%) | float |
| total_share | 总股本(万股) | float |
| float_share | 流通股本(万股) | float |
| free_share | 自由流通股本(万股) | float |
| total_mv | 总市值(万元) | float |
| circ_mv | 流通市值(万元) | float |

---

### 4.5 利润表

| 项目 | 说明 |
|------|------|
| Tushare 接口 | `income` |
| 输出文件 | `income.csv` |
| 取数频率 | 季度更新(财报发布后) |
| 必填参数 | `ts_code` |
| 说明 | 获取合并报表数据 |

**请求参数:**

```yaml
api: income
params:
  ts_code: "{ts_code}"
  start_date: "{list_date}"    # 按公告日起始
  report_type: "1"             # 1=合并报表
```

**输出字段 (核心, 全量字段约 80+):**

| 字段 | 含义 | 类型 |
|------|------|------|
| ts_code | 股票代码 | string |
| ann_date | 公告日期 | string |
| f_ann_date | 实际公告日期 | string |
| end_date | 报告期 | string |
| report_type | 报告类型 | int |
| comp_type | 公司类型 | int |
| basic_eps | 基本每股收益 | float |
| diluted_eps | 稀释每股收益 | float |
| total_revenue | 营业总收入 | float |
| revenue | 营业收入 | float |
| operate_cost | 营业成本 | float |
| operate_profit | 营业利润 | float |
| total_profit | 利润总额 | float |
| income_tax | 所得税 | float |
| n_income | 净利润 | float |
| n_income_attr_p | 归母净利润 | float |
| ebit | 息税前利润 | float |
| ebitda | 息税折旧摊销前利润 | float |
| rd_exp | 研发费用 | float |
| fin_exp | 财务费用 | float |
| sell_exp | 销售费用 | float |
| admin_exp | 管理费用 | float |

---

### 4.6 资产负债表

| 项目 | 说明 |
|------|------|
| Tushare 接口 | `balancesheet` |
| 输出文件 | `balancesheet.csv` |
| 取数频率 | 季度更新(财报发布后) |
| 必填参数 | `ts_code` |

**请求参数:**

```yaml
api: balancesheet
params:
  ts_code: "{ts_code}"
  start_date: "{list_date}"
  report_type: "1"
```

**输出字段 (核心, 全量字段约 160+):**

| 字段 | 含义 | 类型 |
|------|------|------|
| ts_code | 股票代码 | string |
| ann_date | 公告日期 | string |
| end_date | 报告期 | string |
| report_type | 报告类型 | int |
| total_assets | 总资产 | float |
| total_liab | 总负债 | float |
| total_hldr_eqy_exc_min_int | 所有者权益(不含少数股东权益) | float |
| total_hldr_eqy_inc_min_int | 所有者权益(含少数股东权益) | float |
| money_cap | 货币资金 | float |
| total_cur_assets | 流动资产合计 | float |
| total_nca | 非流动资产合计 | float |
| total_cur_liab | 流动负债合计 | float |
| total_ncl | 非流动负债合计 | float |
| accounts_rece | 应收账款 | float |
| inventories | 存货 | float |
| fixed_assets | 固定资产 | float |
| goodwill | 商誉 | float |

---

### 4.7 现金流量表

| 项目 | 说明 |
|------|------|
| Tushare 接口 | `cashflow` |
| 输出文件 | `cashflow.csv` |
| 取数频率 | 季度更新(财报发布后) |
| 必填参数 | `ts_code` |

**请求参数:**

```yaml
api: cashflow
params:
  ts_code: "{ts_code}"
  start_date: "{list_date}"
  report_type: "1"
```

**输出字段 (核心, 全量字段约 100+):**

| 字段 | 含义 | 类型 |
|------|------|------|
| ts_code | 股票代码 | string |
| ann_date | 公告日期 | string |
| end_date | 报告期 | string |
| net_profit | 净利润 | float |
| n_cashflow_act | 经营活动现金流净额 | float |
| n_cashflow_inv_act | 投资活动现金流净额 | float |
| n_cash_flows_fnc_act | 筹资活动现金流净额 | float |
| n_incr_cash_cash_equ | 现金及等价物净增加额 | float |
| c_cash_equ_beg_period | 期初现金及等价物余额 | float |
| c_cash_equ_end_period | 期末现金及等价物余额 | float |
| free_cashflow | 自由现金流 | float |

---

### 4.8 财务指标

| 项目 | 说明 |
|------|------|
| Tushare 接口 | `fina_indicator` |
| 输出文件 | `fina_indicator.csv` |
| 取数频率 | 季度更新(财报发布后) |
| 必填参数 | `ts_code` |
| 注意事项 | 单次最多返回 100 条记录 |

**请求参数:**

```yaml
api: fina_indicator
params:
  ts_code: "{ts_code}"
  start_date: "{list_date}"
```

**输出字段 (核心指标):**

#### 每股指标

| 字段 | 含义 |
|------|------|
| eps | 每股收益 |
| bps | 每股净资产 |
| ocfps | 每股经营现金流 |
| revenue_ps | 每股营业收入 |

#### 盈利能力

| 字段 | 含义 |
|------|------|
| roe | 净资产收益率(加权) |
| roa | 总资产收益率 |
| netprofit_margin | 销售净利率 |
| grossprofit_margin | 销售毛利率 |

#### 成长能力

| 字段 | 含义 |
|------|------|
| or_yoy | 营业收入同比增长率(%) |
| netprofit_yoy | 净利润同比增长率(%) |
| dt_netprofit_yoy | 扣非净利润同比增长率(%) |
| roe_yoy | ROE 同比增长率(%) |

#### 偿债能力

| 字段 | 含义 |
|------|------|
| current_ratio | 流动比率 |
| quick_ratio | 速动比率 |
| debt_to_assets | 资产负债率(%) |

#### 营运能力

| 字段 | 含义 |
|------|------|
| ar_turn | 应收账款周转率 |
| ca_turn | 流动资产周转率 |
| assets_turn | 总资产周转率 |

---

## 5. 取数执行流程

### 5.1 标准执行步骤

```
步骤 1: 读取股票池配置 (stock_list.yaml)
         │
步骤 2: 遍历每只股票
         │
         ├── 2.1 调用 stock_basic → 获取上市日期等基本信息 → 保存 stock_basic.csv
         │
         ├── 2.2 调用 daily (start_date=上市日期) → 保存 daily.csv
         │
         ├── 2.3 调用 adj_factor (start_date=上市日期) → 保存 adj_factor.csv
         │
         ├── 2.4 调用 daily_basic (ts_code, start_date=上市日期) → 保存 daily_basic.csv
         │    注意: 超过 6000 条需分批获取
         │
         ├── 2.5 调用 income (ts_code, report_type=1) → 保存 income.csv
         │
         ├── 2.6 调用 balancesheet (ts_code, report_type=1) → 保存 balancesheet.csv
         │
         ├── 2.7 调用 cashflow (ts_code, report_type=1) → 保存 cashflow.csv
         │
         └── 2.8 调用 fina_indicator (ts_code) → 保存 fina_indicator.csv
              注意: 超过 100 条需分批获取(按年份分段)
         │
步骤 3: 数据质量校验
         │
步骤 4: 生成取数报告 (成功/失败/缺失统计)
```

### 5.2 分批策略

针对有返回条数限制的接口，采用以下分批策略：

**daily_basic (单次上限 6000 条):**
- 按年度分批请求: 每次请求一年的数据
- 对于上市超过 10 年的股票，可能需要 10+ 次请求
- 分批逻辑: 按 start_date 和 end_date 切分为年度区间

**fina_indicator (单次上限 100 条):**
- 按年度分批请求: 每次请求一年的数据
- 一只股票按季度报告通常有 20-40 条/年
- 分批逻辑: 按 period 切分为年度区间

### 5.3 错误处理

| 错误类型 | 处理方式 |
|---------|---------|
| 接口返回空数据 | 记录日志，跳过，标记为 "无数据" |
| 接口超时 | 重试 3 次，间隔 5 秒 |
| 数据格式异常 | 记录异常行号，保留原始数据，继续处理 |
| 文件写入失败 | 检查目录是否存在，创建后重试 |
| 部分字段缺失 | 保留缺失字段为空值，不中断流程 |

---

## 6. 数据质量校验

每个数据模块取数完成后，执行以下校验:

### 6.1 通用校验

| 校验项 | 规则 | 级别 |
|--------|------|------|
| 行数非零 | 文件行数 > 1 (至少含表头 + 1行数据) | ERROR |
| 无重复行 | 按主键(日期/代码)去重后行数一致 | WARNING |
| 字段完整 | 所有列头均存在 | ERROR |
| 编码正确 | 文件可被 UTF-8 正常读取 | ERROR |

### 6.2 各模块专项校验

**daily:**
- trade_date 连续性检查 (跳过非交易日)
- close > 0
- high >= low
- vol >= 0

**adj_factor:**
- adj_factor > 0
- 与 daily 的 trade_date 集合匹配度 > 95%

**daily_basic:**
- 与 daily 的 trade_date 集合匹配度 > 95%
- total_mv > 0 (当收盘价 > 0 时)

**财务报表 (income/balancesheet/cashflow/fina_indicator):**
- ann_date 格式正确 (YYYYMMDD)
- end_date 为季末日期 (0331/0630/0930/1231)
- 关键金额字段不为负 (资产类、收入类)

---

## 7. 扩展指南

### 7.1 新增股票

在 `config/stock_list.yaml` 的 `stocks` 列表中添加新条目:

```yaml
  - name: 新股票名称
    ts_code: XXXXXX.XX
    exchange: SSE 或 SZSE
    industry: 行业分类
```

然后按照第 5 节的执行流程对该股票执行全量取数。

### 7.2 新增数据类型

1. 在 `spec` 中新增对应的数据模块定义 (参考第 4 节格式)
2. 确认 Tushare 接口名称、必填参数、字段列表
3. 定义输出文件名和存储路径
4. 在执行流程 (第 5 节) 中新增对应步骤
5. 在数据质量校验 (第 6 节) 中新增校验规则

### 7.3 增量更新策略

对于已存在的数据文件，增量更新流程:
1. 读取现有 CSV 文件的最新日期
2. 以 `最新日期 + 1` 作为 start_date 请求新数据
3. 将新数据追加到现有文件 (跳过表头)
4. 执行数据质量校验

---

## 8. 附录

### 8.1 三只股票上市信息

| 股票 | 代码 | 上市日期 | 总股本(参考) |
|------|------|---------|-------------|
| 中芯国际 | 688981.SH | 2020-07-16 | 约 79.5 亿股 |
| 比亚迪   | 002594.SZ  | 2011-06-30 | 约 35.6 亿股 |
| 长江电力 | 600900.SH  | 2003-11-18 | 约 245.4 亿股 |

### 8.2 Tushare 接口调用注意事项

1. **ts_code 格式**: `{6位代码}.{交易所后缀}`，如 `688981.SH`、`002594.SZ`
2. **日期格式**: `YYYYMMDD`，如 `20240101`
3. **分批限制**: daily_basic(6000条)、fina_indicator(100条) 需特别注意
4. **report_type**: `1`=合并报表, `2`=单季报表
5. **comp_type**: `1`=一般工商业, `2`=银行, `3`=保险, `4`=证券 (本次三只股票均为 1)

### 8.3 取数执行检查清单

- [ ] 股票池配置文件已准备 (stock_list.yaml)
- [ ] 数据存储目录已创建 (data/{exchange}_{code}/)
- [ ] stock_basic 已获取 (获取 list_date)
- [ ] daily 行情数据已获取
- [ ] adj_factor 复权因子已获取
- [ ] daily_basic 每日基本面已获取 (注意分批)
- [ ] income 利润表已获取
- [ ] balancesheet 资产负债表已获取
- [ ] cashflow 现金流量表已获取
- [ ] fina_indicator 财务指标已获取 (注意分批)
- [ ] 数据质量校验通过
- [ ] 取数报告已生成
