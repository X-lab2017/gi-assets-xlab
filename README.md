## 一、关于官方文档
[G6VP的产品文档](https://www.yuque.com/antv/gi)在语雀上，其中“开放中心”这一子目录下的几篇文章向资产开发者介绍**如何从头开发自定义资产**。读下来的感觉是，如果仅仅是阅读完这些文章，对于一个开发经验不足并且之前完全不知道G6VP的人（我们）来说，只能说有了一个初步印象，并不能直接上手。可以在实际开发时反复回头来看这几篇文档，作为参考。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/21625412/1684326810306-fce65161-4f5f-4637-8138-fcfd122517d5.png#averageHue=%23faf8f8&clientId=u0f705e15-79f2-4&from=paste&height=349&id=u8c36b3c6&originHeight=1794&originWidth=3000&originalType=binary&ratio=2&rotation=0&showTitle=false&size=511330&status=done&style=none&taskId=u06fe60f9-550a-4c0f-a47e-b5525d99eae&title=&width=583)
## 二、G6VP是什么？
我体验了[G6VP平台](https://insight.antv.antgroup.com/)并阅读了部分上面提到的产品文档，说一下个人的理解。我们实验室的同学比较熟悉低代码大屏搭建平台DataEase，不妨**以DataEase来类比G6VP**。

| **DataEase** | **G6VP** |
| --- | --- |
| 在DE中，我们新建一个“仪表板”，然后进入编辑界面就可以拖拉拽一些组件搭建大屏，每个组件的数据源、功能、样式都是**可配置**的。编辑完后发布仪表板，所有人都能在公网上查看这个大屏了。实验室是自己部署了一个[DataEase实例](https://dataease.x-lab.info/)。DE管理平台和发布后的大屏都部署在同一个云服务器实例上。并且由于DE具备账户权限系统，支持多人一起（but分时）在上面编辑同一个仪表板。 | 在G6VP中，我们新建一个“画布”，在一开始就要选择图数据来源，然后进入编辑界面就可以选择组件，并且组件的功能和样式也是**可配置**的。编辑完后，导出为一个网页App（比如导出SDK时选择导出为HTML），然后自己部署到服务器上，其他人就能体验这个图应用了。[官方的G6VP平台](https://insight.antv.antgroup.com/)，对于外部用户（我们）来说，所有数据来源配置和画布信息都**存在本地的IndexedDB**中，不能享受账户同步功能。如果官方提供的组件还不能满足要求，可以自己写“资产”并导入（“开放市场”->“本地上传资产包”）到G6VP中。资产导入后会存在IndexedDB中，下次打开G6VP平台时仍然存在。 |
| **相同** | **不同** |
| 这两个都是PaaS，都是“造应用的应用”，DE的产物是一个个大屏，G6VP的产物是一个个可交互的图应用。 | DE不支持自定义功能（如果你想加，可能要去DE的GitHub仓库提新功能PR），G6VP**支持以“开发自定义资产+本地上传资产包”的形式为G6VP添加自定义新功能**。 |

## 三、资产是什么？
这个仓库名叫“gi-assets-xlab”，意思是X-lab为G6VP（先前叫“**G**raph **I**nsight”）开发的资产。前一小节也提到了G6VP的特色功能“导入自定义资产”，那么什么是“资产”？我的理解是：它是一个功能包，将资产导入G6VP平台，就能为G6VP提供新功能。所谓的“功能”，可以是`component`、`element`、`layout`、`service`、`template`中的任意一种（这块儿我还没实践经验，可能有误）。
事实上，**自定义的资产和官方资产是一回事**，可以理解为：在G6VP仓库中写资产就是“官方资产”，在其他地方写资产然后在G6VP平台中上传导入就是“自定义资产”。下图是G6VP项目文件树掠影，可以看到`packages/`目录下有若干个`gi-assets-*/`，这些就是官方资产。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/21625412/1684385071100-12a6875a-a4ad-46a5-bd97-5f77ebfde691.png#averageHue=%23312e2c&clientId=u0f705e15-79f2-4&from=paste&height=361&id=u0ec7698d&originHeight=838&originWidth=1138&originalType=binary&ratio=2&rotation=0&showTitle=false&size=227129&status=done&style=none&taskId=u4c6f5492-d0db-4358-903c-91b9ac36dc5&title=&width=490)
## 四、我们要开发什么样的资产？
前面提到，当官方功能不够用的时候，就需要写自定义资产来引入自定义功能。由于笔者没有体验完所有官方功能，其实仅凭我自己并不能确定“是不是官方功能真的不够用”。但是有人帮我们评估过了！
G6VP的作者[@山果(shanguo)](/shanguo)在第一次线下见面的时候，**就那时设想的产品形态**给出了**两个组件**的建议：

1. **搜索框。** 由于数据规模的限制，我们没法一次性把全域“仓库<-开发者”协作网络（到底是什么网络数据？其实还没定论）加载到画布中去，因此会采用**数据库（实验室的neo4j实例）直连**的方式，每次只查询单个仓库的网络。搜索框就是对用户进行引导的，应该还要具备“推荐搜索”功能。
2. **节点属性面板。** 设想画布上的图数据是“仓库-开发者”协作网络，那么点击某个仓库节点，节点属性面板就显示仓库的一些信息；点击某个开发者结点，节点属性面板就显示开发者的信息。节点属性面板就是用来做信息增强的，这个面板里可以承载任何东西，这也是**需要设计**的地方。

| **“搜索框”效果图** | **“节点属性面板”效果图** |
| --- | --- |
| ![image.png](https://cdn.nlark.com/yuque/0/2023/png/21625412/1684388465881-e1ed1ba1-138d-4098-880d-177226707276.png#averageHue=%23d5e1f9&clientId=ub988548f-ab69-4&from=paste&height=1024&id=udded9b0b&originHeight=2048&originWidth=4096&originalType=binary&ratio=2&rotation=0&showTitle=false&size=3687916&status=done&style=none&taskId=u23d9fae1-703e-4a99-8402-8c44e05ef7c&title=&width=2048) | ![image.png](https://cdn.nlark.com/yuque/0/2023/png/21625412/1684388455951-ad3f14ab-16f6-4979-84ac-5b6f1684078d.png#averageHue=%2390a398&clientId=ub988548f-ab69-4&from=paste&height=1024&id=u6353ae94&originHeight=2048&originWidth=4096&originalType=binary&ratio=2&rotation=0&showTitle=false&size=3985090&status=done&style=none&taskId=u133f9352-0009-45cf-8975-3e8fa62ef9e&title=&width=2048) |

一个资产可以包含许多功能，所以两个`component`全都放到一个资产里去实现即可。如果后续需要更多的自定义功能，只要在这个仓库里继续追加。
## 五、如何开发上述资产？
我们采用[三方资产开发方式](https://www.yuque.com/antv/gi/zixkzbqndmfnsqel#KZeTk)进行资产的开发。在 @pomelo-nwu 的帮助下，整个开发流程已经跑通，现在我们只要聚焦到几个资产的开发上来就行。这里补一句，其实我们不仅在开发资产，顺便把整个图应用也开发了，这个图应用就是`src/pages`。
### 环境准备
安装[nvm](https://github.com/nvm-sh/nvm)，并用nvm安装node 16，由于项目根目录下有`.nvmrc`文件，正确安装nvm后进入项目目录会自动切换成`.nvmrc`中指定的node版本。
### 开发流程

1. `npm install`
2. `npm run start`
3. 浏览器打开图应用后，[导入mock数据](https://github.com/X-lab2017/gi-assets-xlab/pull/9)到画布
4. 进行开发

注意点：

- 一般情况下聚焦`src/components`目录即可
- 在开发时可以参考G6VP是怎么实现[官方资产](https://github.com/antvis/G6VP/tree/master/packages)的
- ...
