## 语言模型

[立即充值](https://platform.minimax.cn/user-center/payment/balance)

| **模型** | **输入价格**  元/百万 tokens | **输出价格**  元/百万 tokens | **缓存读取**  元/百万 tokens |
| :- | :-: | :-: | :-: |
| **MiniMax-M3.1-Flash** | 1.00 | 4.00 | 0.10 |

> [tab] 标准
>
> | **模型** | **输入价格**  元/百万 tokens | **输出价格**  元/百万 tokens | **缓存读取**  元/百万 tokens |
> | :- | :-: | :-: | :-: |
> | **MiniMax-M3** ≤ 512k 输入 tokens 永久五折 | ~~4.20~~ 2.10 | ~~16.80~~ 8.40 | ~~0.84~~ 0.42 |
> | **MiniMax-M3** > 512k 输入 tokens\* 永久五折 | ~~8.40~~ 4.20 | ~~33.60~~ 16.80 | ~~1.68~~ 0.84 |

> [tab] 优先\*
>
> | **模型** | **输入价格**  元/百万 tokens | **输出价格**  元/百万 tokens | **缓存读取**  元/百万 tokens |
> | :- | :-: | :-: | :-: |
> | **MiniMax-M3** ≤ 512k 输入 tokens 永久五折 | ~~6.30~~ 3.15 | ~~25.20~~ 12.60 | ~~1.26~~ 0.63 |
> | **MiniMax-M3** > 512k 输入 tokens 永久五折 | ~~12.60~~ 6.30 | ~~50.40~~ 25.20 | ~~2.52~~ 1.26 |
>
> \* 优先服务可让请求获得优先准入，从而更快响应并降低失败率。调用时将 `service_tier` 设为 `priority` 即可启用。该层级按标准价格的 1.5 倍计费。

> [!NOTE]
>
> 请注意：
>
> 1. 计费项是token数；tokens字符比值根据使用场景的不同略有浮动，以实际消耗为准，字符数包括标点等
> 2. Token与字符比（估算）：1600 中文字符约消耗 1000 tokens

## 视频

[立即充值](https://platform.minimax.cn/user-center/payment/balance)

### H3 系列旗舰模型

<table>
  <thead>
    <tr>
      <th>模型</th>
      <th>输出分辨率</th>
      <th>输出视频\
      每秒</th>
      <th>输入视频\
      每秒</th>
      <th>输入图片\
      每张\
      超出免费额度后</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td rowSpan="2">**MiniMax-H3**\
      画质优先，适合高品质视频创作</td>
      <td>2K</td>
      <td>¥0.80</td>
      <td>¥0.80</td>
      <td>¥0.20</td>
    </tr>

    <tr>
      <td>768P</td>
      <td>¥0.50</td>
      <td>¥0.50</td>
      <td>¥0.20</td>
    </tr>

    <tr>
      <td rowSpan="2">**MiniMax-H3-Highspeed**\
      兼顾质量与速度，适合日常内容创作</td>
      <td>768P</td>
      <td>¥0.40</td>
      <td>¥0.40</td>
      <td>¥0.20</td>
    </tr>

    <tr>
      <td>480P</td>
      <td>¥0.26</td>
      <td>¥0.26</td>
      <td>¥0.20</td>
    </tr>

    <tr>
      <td rowSpan="2">**MiniMax-H3-Lite**\
      更低的成本，适合创意尝试与批量生成</td>
      <td>768P</td>
      <td>¥0.26</td>
      <td>¥0.26</td>
      <td>¥0.13</td>
    </tr>

    <tr>
      <td>480P</td>
      <td>¥0.16</td>
      <td>¥0.16</td>
      <td>¥0.13</td>
    </tr>
  </tbody>
</table>

* **图片输入**：每次任务前 **5 张**免费，超出部分按张计费；单价不随图片或输出视频分辨率变化。
* **视频输入**：按输入时长及所选模型的输出分辨率计费。
* **任务类型**：同一模型、同一分辨率下，各任务类型单价相同；音频输入免费。

> [accordion] 查看旗舰模型任务类型
>
> <table>
>   <thead>
>     <tr>
>       <th>模型</th>
>       <th>文生 t2v</th>
>       <th>图生 i2v</th>
>       <th>首尾帧 fl2v</th>
>       <th>参考生 ref</th>
>     </tr>
>   </thead>
>
>   <tbody>
>     <tr>
>       <td>MiniMax-H3</td>
>       <td>支持</td>
>       <td>支持</td>
>       <td>支持</td>
>       <td>图片、视频、音频</td>
>     </tr>
>
>     <tr>
>       <td>MiniMax-H3-Highspeed</td>
>       <td>支持</td>
>       <td>支持</td>
>       <td>支持</td>
>       <td>图片、视频、音频</td>
>     </tr>
>
>     <tr>
>       <td>MiniMax-H3-Lite</td>
>       <td>支持</td>
>       <td>支持</td>
>       <td>支持</td>
>       <td>图片、视频、音频</td>
>     </tr>
>   </tbody>
> </table>

### H3 系列扩展模型

<table>
  <thead>
    <tr>
      <th>模型</th>
      <th>输出分辨率</th>
      <th>输出视频\
      每秒</th>
      <th>输入视频\
      每秒</th>
      <th>输入图片\
      每张\
      超出免费额度后</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      <td rowSpan="2">**MiniMax-H3-Max**\
      支持图片、视频和音频参考，适合多素材视频创作</td>
      <td>768P</td>
      <td>¥0.50</td>
      <td>¥0.97</td>
      <td>¥0.50</td>
    </tr>

    <tr>
      <td>480P</td>
      <td>¥0.33</td>
      <td>¥0.37</td>
      <td>¥0.50</td>
    </tr>
  </tbody>
</table>

* **MiniMax-H3-Max**：每次任务前 **2 张**图片免费，超出部分按张计费；输入视频按时长及输出分辨率计费。音频输入免费。

> [accordion] 查看扩展模型任务类型
>
> <table>
>   <thead>
>     <tr>
>       <th>模型</th>
>       <th>文生 t2v</th>
>       <th>图生 i2v</th>
>       <th>首尾帧 fl2v</th>
>       <th>参考生 ref</th>
>     </tr>
>   </thead>
>
>   <tbody>
>     <tr>
>       <td>MiniMax-H3-Max</td>
>       <td>支持</td>
>       <td>支持</td>
>       <td>支持</td>
>       <td>图片、视频、音频</td>
>     </tr>
>   </tbody>
> </table>

