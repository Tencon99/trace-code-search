<!--
 * @Author: Tencon99 cyhtq1999@163.com
 * @Date: 2025-01-02 17:34:04
 * @LastEditors: Tencon99 cyhtq1999@163.com
 * @LastEditTime: 2026-10-27 20:12:48
 * @FilePath: \trace-code-search\README.md
 * @Description: 文件描述
 * 
 * Copyright (c) 2026 by ${git_name_email}, All Rights Reserved. 
-->
# trace-code-search

## 安装依赖
```
npm install
```

### 启动开发服务（支持热更新）
```
npm run serve
```

### 构建生产版本
```
npm run build
```

### 检查并自动修复代码格式
```
npm run lint
```

### 自定义配置

参阅 [Vue CLI 配置文档](https://cli.vuejs.org/config/)。


### 压缩字体文件

```sh
font-spider xxxxx_sindex.html
```

## 部署记录

以下信息已于 2026 年 10 月 27 日核实：

- 当前部署平台：腾讯云对象存储 COS，存储桶为 `test-1258029302`，地域为广州（`ap-guangzhou`）。
- 线上网站：https://test-1258029302.cos-website.ap-guangzhou.myqcloud.com/
- 线上 `index.html` 最后修改时间：北京时间 2025 年 7 月 20 日 19:21:43。
- 已开启静态网站托管，首页为 `index.html`；未发现 COS 自定义域名配置。
- 部署命令：`npm run deploy`，实际执行 `npm run build && node upload-to-cos.js`，即先构建，再上传。
- 上传位置：存储桶根目录 `/`。当前脚本未使用 `.env` 中的 `COS_BASE_PATH` 配置。
- 早期 GitHub Pages 地址：https://tencon99.github.io/trace-code-search/ （仍可访问，页面响应头显示最后修改日期为 2025 年 1 月 2 日）。
- Git 远程仓库：git@github.com:Tencon99/trace-code-search.git

### 再次部署前需要处理的问题

- `src/services/cosService.js` 引用了 `VUE_APP_COS_SECRET_ID` 和 `VUE_APP_COS_SECRET_KEY`，Vue CLI 会将这些值打包到浏览器代码中。发布新版本前，应将私有媒体的签名逻辑移到服务端，部署密钥仅保留在部署机器上。
- `upload-to-cos.js` 会在上传前删除 `css/`、`img/`、`fonts/` 和 `js/` 下的旧资源。应改为先上传资源，最后发布 `index.html`，避免部署过程中线上网站无法正常访问。
- 当前脚本在上传失败时只记录日志，不能可靠地以失败状态退出，因此不能仅凭退出码为零判断部署成功。

本次核查未执行新的线上部署。
