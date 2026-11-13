// Original bilingual project guides by Yanbing Chen and Ganrong(James) Fu.
// These are contextual essays and reading prompts, not Yu Qiuyu's text or its translation.
// Sources support the geographical and historical background. Interpretive questions are our own.
const guides = {
  dujiangyan: {
    sections: [
      {
        id: 'dujiangyan-river',
        title: { en: 'A river meets the plain', zh: '江水走向平原' },
        scene: 'yangtze',
        body: {
          en: [
            'At the western edge of the Chengdu Plain, Dujiangyan guides water from the Minjiang River toward farmland. Construction began in the third century BCE, and the irrigation system remains in use.',
            'Begin with a change of scale. Follow the water from a mountain outlet to an imagined field. What becomes visible when a landscape is understood through the people it supports?',
          ],
          zh: [
            '在成都平原西缘，都江堰把岷江之水引向农田。这套水利工程始建于公元前三世纪，至今仍在发挥灌溉作用。',
            '先换一个观察尺度，沿着水流从山口走向想象中的田地。如果通过土地养育的人来理解风景，你会看见哪些原本忽略的细节？',
          ],
        },
      },
      {
        id: 'dujiangyan-design',
        title: { en: 'Working with the current', zh: '顺着水势思考' },
        scene: 'lines',
        body: {
          en: [
            'The Fish Mouth divides the flow, while Feishayan and Baopingkou help manage overflow, sediment, and diversion. UNESCO describes a design that uses local terrain and river behavior without a conventional dam.',
            'Consider the chapter through the idea of useful achievement. How might patient adjustment, maintenance, and shared benefit change our usual picture of a monument?',
          ],
          zh: [
            '鱼嘴分流，飞沙堰和宝瓶口共同调节溢流、泥沙与引水。联合国教科文组织介绍，这套设计利用当地地形与水流规律，无需传统的拦河大坝。',
            '可以从“有益于人”的成就来进入这一章。持续调整、日常维护和共同受益，会怎样改变我们对纪念性工程的理解？',
          ],
        },
      },
      {
        id: 'dujiangyan-care',
        title: { en: 'The work that continues', zh: '仍在继续的工作' },
        scene: 'earth-return',
        body: {
          en: [
            'An operating water system asks us to think beyond its founding moment. Its continued usefulness connects an ancient design with the ordinary needs of later generations.',
            'For your reading notes, choose one form of care that rarely receives a statue. Explain how its value might be measured through everyday life, then return to the river on the map.',
          ],
          zh: [
            '一套仍在运转的水利系统，让人把目光放到建成之日以后的漫长时间。它不断发挥作用，也把古老的设计与后来世代的日常需要联系起来。',
            '记下某一种很少被立碑纪念的照料工作。试着从日常生活衡量它的价值，再回到地图上的河流，看看你的注意力是否发生了变化。',
          ],
        },
      },
    ],
    sources: [{ title: 'UNESCO · Mount Qingcheng and the Dujiangyan Irrigation System', url: 'https://whc.unesco.org/en/list/1001/' }],
  },
  'taoist-tower': {
    sections: [
      {
        id: 'taoist-tower-discovery',
        title: { en: 'A small room, a large history', zh: '小小石室，漫长历史' },
        scene: 'eurasia',
        body: {
          en: [
            'At Mogao near Dunhuang, the Daoist caretaker Wang Yuanlu discovered the sealed Library Cave in 1900. Its manuscripts and other objects opened a remarkable window onto religious and everyday life along the Silk Roads.',
            'Keep the scale of the discovery in mind. A small doorway can lead a reader toward questions that reach far beyond one person or place.',
          ],
          zh: [
            '1900年，在敦煌莫高窟看护洞窟的道士王圆箓发现了封闭的藏经洞。其中的文书与其他物品，为了解丝绸之路上的宗教和日常生活打开了一扇重要窗口。',
            '记住这次发现的尺度。一道小小的洞门，能够引出远远超越一个人、一个地点的问题，阅读也可以从这里展开。',
          ],
        },
      },
      {
        id: 'taoist-tower-custody',
        title: { en: 'Following the objects', zh: '追寻文物的去向' },
        scene: 'sealed',
        body: {
          en: [
            'Many Library Cave objects later entered collections outside China. The International Dunhuang Programme documents material acquired by Aurel Stein and now held by institutions in Britain and India.',
            'Use this history to frame questions about custody and responsibility. Who had the power to move an object, who could protect it, and whose account survives alongside it?',
          ],
          zh: [
            '此后，许多藏经洞文物进入了中国以外的收藏机构。国际敦煌项目记录了斯坦因取得、如今由英国和印度多家机构保存的相关材料。',
            '可以由此思考保管与责任。谁有能力带走一件文物，谁有条件保护它，又有谁的叙述能够与它一起留存下来？',
          ],
        },
      },
      {
        id: 'taoist-tower-judgment',
        title: { en: 'Reading anger carefully', zh: '认真阅读愤怒' },
        scene: 'earth-return',
        body: {
          en: [
            'For this chapter, try holding an emotional response beside a historical question. Grief over cultural loss can motivate investigation into decisions, institutions, and the circumstances surrounding them.',
            'Write two notes after reading. Record a detail that shapes your judgment, then a question the available evidence leaves open. This keeps feeling connected to careful inquiry.',
          ],
          zh: [
            '阅读这一章时，可以把情绪与历史问题放在一起。面对文化流失的痛惜，能够进一步推动我们调查当时的决定、制度以及相关处境。',
            '读后写下两条笔记。一条记录影响你判断的细节，另一条记录现有证据尚未回答的问题，让情感始终与认真求证保持联系。',
          ],
        },
      },
    ],
    sources: [
      { title: 'Hong Kong Heritage Museum · Dunhuang education booklet', url: 'https://hk.heritage.museum/documents/doc/tc/exhibitions/current_exhibitions/Dunhuang_Educational_Booklet.pdf' },
      { title: 'International Dunhuang Programme · Wang Yuanlu and the Stein collection', url: 'https://idp.bl.uk/blog/shaping-the-stein-collections-dunhuang-corpus-1-wang-yuanlu-the-first-curator/' },
    ],
  },
  'mogao-caves': {
    sections: [
      {
        id: 'mogao-caves-cliff',
        title: { en: 'An oasis and its caves', zh: '绿洲旁的石窟' },
        scene: 'eurasia',
        body: {
          en: [
            'The Mogao Caves stand southeast of the Dunhuang oasis in Gansu, in cliffs above the Dachuan River. Their surviving paintings and sculptures record centuries of Buddhist artistic activity.',
            'Locate Dunhuang within a wider network of journeys. An oasis offers a useful starting point for thinking about how movement, settlement, and religious practice can meet in one place.',
          ],
          zh: [
            '莫高窟位于甘肃敦煌绿洲东南侧，开凿在大泉河上方的崖壁中。现存壁画和彩塑记录了延续数百年的佛教艺术活动。',
            '把敦煌放进更广阔的旅行网络中。一片绿洲可以成为思考的起点，帮助我们理解流动、定居与宗教实践如何在同一处相遇。',
          ],
        },
      },
      {
        id: 'mogao-caves-images',
        title: { en: 'Looking for human details', zh: '寻找画中的人间' },
        scene: 'borderlands',
        body: {
          en: [
            'UNESCO notes that Mogao imagery includes farming, clothing, travel, and cultural exchange alongside Buddhist subjects. Cave 61 even contains a detailed painted landscape of Mount Wutai.',
            'Choose one kind of detail to follow as you read. A road, a garment, or a working figure may help you connect a grand account of civilization with an individual human action.',
          ],
          zh: [
            '联合国教科文组织指出，莫高窟图像在佛教题材之外，还展现了耕作、服饰、旅行和文化交流。第61窟甚至绘有细致的五台山图。',
            '阅读时可以选定一类细节持续观察。一条路、一件衣服或一个劳动中的人物，都能把宏大的文明叙述与具体的人的行动联系起来。',
          ],
        },
      },
      {
        id: 'mogao-caves-time',
        title: { en: 'Time within a single view', zh: '一眼之间的时间' },
        scene: 'earth-return',
        body: {
          en: [
            'A cave complex built across centuries invites a slower way of looking. Different makers and viewers leave us with a site whose history cannot fit into one moment.',
            'Try describing what you would examine first, then what a second visit might reveal. Let this exercise guide your reading of artistic inheritance, memory, and the care that preservation requires.',
          ],
          zh: [
            '经历多个世纪营建的石窟群，值得用更慢的速度观看。不同的创作者和观看者共同留下了这个地方，它的历史难以被压缩成一个瞬间。',
            '试着描述第一次观看时你会注意什么，再想想第二次可能发现什么。让这个练习带你思考艺术传承、记忆以及保存所需的照料。',
          ],
        },
      },
    ],
    sources: [{ title: 'UNESCO · Mogao Caves', url: 'https://whc.unesco.org/en/list/440/' }],
  },
  'secret-spring': {
    sections: [
      {
        id: 'secret-spring-water',
        title: { en: 'Water among the dunes', zh: '沙丘之间的水' },
        scene: 'climate',
        body: {
          en: [
            'Crescent Moon Spring lies among the dunes of the Mingsha Mountain area at Dunhuang. UNESCO includes this meeting of water and sand in its account of the Dunhuang Global Geopark.',
            'Begin by noticing contrast in scale and texture. A small patch of water may hold your attention differently when the surrounding landscape makes every glimpse of it feel significant.',
          ],
          zh: [
            '月牙泉位于敦煌鸣沙山地区的沙丘之间。联合国教科文组织在介绍敦煌世界地质公园时，特别提到了这处水与沙相遇的景观。',
            '先观察尺度和质感的差异。当周围的环境让每一次见到水都显得珍贵，一小片水面也许会以不同的方式吸引你的注意。',
          ],
        },
      },
      {
        id: 'secret-spring-attention',
        title: { en: 'What scarcity makes visible', zh: '稀少让什么显现' },
        scene: 'borderlands',
        body: {
          en: [
            'The geopark also preserves evidence of erosion, river deposits, and changing landscapes. Its desert setting offers a reminder that a view has a history longer than a visitor’s stay.',
            'For this chapter, consider how thirst, relief, or surprise might change perception. Which ordinary things become precious when their availability changes, and how would you describe that shift?',
          ],
          zh: [
            '地质公园还保存着侵蚀、河流沉积和地貌变化的痕迹。眼前的沙漠提醒我们，风景的历史远比游客停留的时间漫长。',
            '阅读这一章时，可以思考口渴、舒缓或惊喜怎样改变感受。当获取条件发生变化，哪些平常的事物会变得珍贵？你会如何描述这种转变？',
          ],
        },
      },
      {
        id: 'secret-spring-care',
        title: { en: 'Staying with the question', zh: '让问题停留片刻' },
        scene: 'earth-return',
        body: {
          en: [
            'A spring can become a symbol of renewal in a reader’s imagination. Keeping its physical setting in view also gives that symbol limits, grounding reflection in a particular place.',
            'Write a short response using one sensory observation and one question about care. How could admiration for a fragile landscape influence the way someone approaches and remembers it?',
          ],
          zh: [
            '在读者的想象中，一眼泉水可以象征重新获得生机。始终记住它具体的环境，也能让这种象征有所依托，把思考安放在真实的地方。',
            '用一条感官观察和一个关于照料的问题写下简短回应。对脆弱风景的欣赏，会怎样影响一个人走近它、记住它的方式？',
          ],
        },
      },
    ],
    sources: [{ title: 'UNESCO · Dunhuang Global Geopark', url: 'https://www.unesco.org/en/iggp/dunhuang-unesco-global-geopark' }],
  },
  yangguan: {
    sections: [
      {
        id: 'yangguan-pass',
        title: { en: 'A passage westward', zh: '走向西方的关口' },
        scene: 'boundary',
        body: {
          en: [
            'Yangguan lies southwest of Dunhuang and was established during the Han dynasty. Its name distinguishes its southern position from Yumenguan, another important pass in the region.',
            'A pass can organize a journey into an approach, a crossing, and a departure. Use those three stages to consider how a geographical location acquires emotional weight in a travel narrative.',
          ],
          zh: [
            '阳关位于敦煌西南，始设于汉代。它因在玉门关以南而得名，两处关口都曾在这一地区发挥重要作用。',
            '一道关口可以把旅途分成走近、穿过和远去三个阶段。顺着这三个阶段，想想一个地理位置如何在旅行叙述中积累情感的重量。',
          ],
        },
      },
      {
        id: 'yangguan-memory',
        title: { en: 'A name carried by poetry', zh: '诗歌传下来的地名' },
        scene: 'borderlands',
        body: {
          en: [
            'Yangguan is closely associated with Wang Wei’s farewell poem for a friend traveling to Anxi. The surviving ruins and this literary memory offer different ways of encountering the same place.',
            'Notice what a familiar name makes you expect before a visit. How might weather, silence, or distance alter an image already formed through poems and stories?',
          ],
          zh: [
            '阳关与王维送友人出使安西的诗篇紧密相连。现存遗迹与这份文学记忆，提供了接近同一个地方的不同路径。',
            '留意一个熟悉的名字会让你在到达之前产生什么期待。天气、寂静或者距离，会怎样改变早已由诗歌和故事形成的印象？',
          ],
        },
      },
      {
        id: 'yangguan-parting',
        title: { en: 'Reading a departure', zh: '阅读一次远行' },
        scene: 'eurasia',
        body: {
          en: [
            'For this chapter, use departure as a reading lens. The person who leaves and the person who remains can attach very different meanings to the same stretch of road.',
            'Imagine a brief farewell from each viewpoint, using your own words. Then ask what the map can show about their separation and what only an account of human experience can express.',
          ],
          zh: [
            '可以从“离开”这个角度进入这一章。远行的人与留下的人，可能赋予同一段道路截然不同的意义。',
            '用自己的语言，分别从双方的视角想象一次简短告别。再思考，地图能呈现他们分离的哪些部分，又有哪些内容需要通过人的经历才能表达？',
          ],
        },
      },
    ],
    sources: [{ title: 'China Culture · Yangguan Pass', url: 'https://en.chinaculture.org/2017-09/18/content_1073149.htm' }],
  },
  kashgar: {
    sections: [
      {
        id: 'kashgar-routes',
        title: { en: 'Where routes come together', zh: '道路相会之处' },
        scene: 'eurasia',
        body: {
          en: [
            'Historic routes approaching Kashgar passed along the northern and southern edges of the Taklamakan Desert. The Smithsonian’s Silk Road account places the city within this network of oasis journeys.',
            'Trace a route as a sequence of stops. What changes when you imagine the need for water, rest, and conversation between the distant points that a map connects?',
          ],
          zh: [
            '历史上通往喀什的道路，曾沿塔克拉玛干沙漠的南北边缘延伸。史密森学会的丝绸之路介绍，将这座城市放在连接多个绿洲的旅程之中。',
            '把路线看作一连串停留之处。地图连接远方地点时，如果同时想到饮水、休息和交流的需要，你对旅途的理解会发生什么变化？',
          ],
        },
      },
      {
        id: 'kashgar-exchange',
        title: { en: 'The work of meeting', zh: '相遇需要什么' },
        scene: 'borderlands',
        body: {
          en: [
            'UNESCO’s documentary record describes Kashgar as a commercial center on the old Silk Road. Exchange provides one useful way to approach a city connected with travelers arriving from different directions.',
            'Think beyond the goods themselves. A meeting can require translation, trust, bargaining, and patience. Which of these human activities would you notice first when reading about an unfamiliar place?',
          ],
          zh: [
            '联合国教科文组织的纪录资料将喀什描述为古丝绸之路上的商业中心。对于一座与各方旅人相连的城市，交流可以成为理解它的一条线索。',
            '把目光也放到货物之外。一次相遇可能需要翻译、信任、商谈和耐心。阅读陌生地方时，你会最先注意到其中哪一种人的活动？',
          ],
        },
      },
      {
        id: 'kashgar-viewpoint',
        title: { en: 'A visitor’s field of view', zh: '旅行者的视野' },
        scene: 'earth-return',
        body: {
          en: [
            'A travel account offers a situated view of a place. For this chapter, attend to the narrator’s attention, asking which encounters become memorable and which experiences remain outside the description.',
            'Choose one passage to discuss from two positions, visitor and resident. What additional questions might a resident ask about the place that a brief journey has allowed the visitor to see?',
          ],
          zh: [
            '旅行叙述总是从某个具体的位置观察地方。阅读这一章时，可以留意叙述者的目光，看看哪些相遇被记住，哪些经历仍留在描述之外。',
            '选择一段文字，分别从游客和居民的角度讨论。对于短暂旅程中所见的地方，长期居住的人还可能提出哪些问题？',
          ],
        },
      },
    ],
    sources: [
      { title: 'Smithsonian National Museum of Asian Art · The Desert Road', url: 'https://asia.si.edu/wp-content/uploads/2023/06/shipwrecked-01-intro.pdf' },
      { title: 'UNESCO Archives · On the Silk Roads, the Desert Route Expedition', url: 'https://www.unesco.org/archives/multimedia/document-4583' },
    ],
  },
  chengde: {
    sections: [
      {
        id: 'chengde-retreat',
        title: { en: 'A retreat with public duties', zh: '园林里的政务' },
        scene: 'boundary',
        body: {
          en: [
            'The Mountain Resort at Chengde, Hebei, was built between 1703 and 1792. Qing emperors used this summer residence to conduct government business and receive visitors as well as to escape the heat.',
            'Enter the chapter with both uses in mind. How does knowing that decisions were made here affect the way you imagine a quiet lake or garden path?',
          ],
          zh: [
            '河北承德的避暑山庄建于1703至1792年。清代皇帝在此避暑，也处理政务、接见来访者。',
            '带着这两种用途进入这一章。当你知道许多决定曾在这里作出，再想象安静的湖面或园中小径时，感受会有什么不同？',
          ],
        },
      },
      {
        id: 'chengde-landscape',
        title: { en: 'A landscape arranged', zh: '经过安排的山水' },
        scene: 'borderlands',
        body: {
          en: [
            'UNESCO describes a complex of palaces, lakes, pastureland, forests, and surrounding temples. The temples bring together architectural elements associated with Han, Mongolian, and Tibetan traditions.',
            'Consider how a designed landscape directs attention. Which routes invite a visitor closer, and which views suggest authority? These questions can help connect the pleasures of a garden with the purposes of its builders.',
          ],
          zh: [
            '联合国教科文组织介绍，这一建筑群由宫殿、湖泊、牧场、森林和周围寺庙组成。寺庙融合了与汉、蒙古和藏族传统相关的建筑元素。',
            '思考经过设计的风景如何引导目光。哪些路径邀请人走近，哪些景象让人感到权威？这些问题能把游园的感受与营建者的意图联系起来。',
          ],
        },
      },
      {
        id: 'chengde-aftermath',
        title: { en: 'Reading what remains', zh: '阅读留下来的事物' },
        scene: 'earth-return',
        body: {
          en: [
            'Buildings can outlast the political world that gave them their original roles. A later visitor brings different expectations, while the arrangement of rooms and grounds continues to shape an encounter.',
            'For your response, select an ordinary feature such as a threshold or a window. How could it help you explore the chapter’s invitation to think about power, distance, and historical memory?',
          ],
          zh: [
            '建筑可能在赋予它最初用途的政治世界结束之后继续存在。后来的游客带着新的期待进入，而房间和庭园的布局仍在影响相遇的方式。',
            '写回应时，可以选择一道门槛或一扇窗这样的平常细节。它怎样帮助你借这一章思考权力、距离以及历史记忆？',
          ],
        },
      },
    ],
    sources: [{ title: 'UNESCO · Mountain Resort and its Outlying Temples, Chengde', url: 'https://whc.unesco.org/en/list/703/' }],
  },
  'fish-tail-lodge': {
    sections: [
      {
        id: 'fish-tail-lodge-pokhara',
        title: { en: 'A lakeside view in Nepal', zh: '尼泊尔湖畔的一眼' },
        scene: 'earth',
        body: {
          en: [
            'Fish Tail Lodge is beside Phewa Lake in Pokhara, Nepal. Nepal’s architectural heritage inventory records its distinctive circular buildings, while the Nepal Tourism Board describes the lake’s setting below the Annapurna range.',
            'This stop extends the journey beyond China. Notice how a change of country and landscape might also change the questions a traveler carries into a place.',
          ],
          zh: [
            '鱼尾山屋位于尼泊尔博卡拉的费瓦湖畔。尼泊尔建筑遗产名录记录了其独特的圆形建筑，尼泊尔旅游局则介绍了湖泊与安纳普尔纳山脉相望的环境。',
            '这一站让旅程走出中国。留意国家与景观的变化，是否也会改变旅行者带进一个地方的问题。',
          ],
        },
      },
      {
        id: 'fish-tail-lodge-reflection',
        title: { en: 'Mountain and reflection', zh: '山峰与倒影' },
        scene: 'eurasia',
        body: {
          en: [
            'Machhapuchhre, whose name evokes a fish’s tail, is a prominent mountain in views from Pokhara. The tourism board notes the impression made by its peak and its reflection in Phewa Lake.',
            'Use the paired images as a reading prompt. How do a solid form and a shifting reflection suggest different ways of remembering a place after leaving it?',
          ],
          zh: [
            '马查普切雷峰的名字让人想到鱼尾，是从博卡拉望向群山时醒目的山峰。旅游局特别提到了它的轮廓及其在费瓦湖中的倒影。',
            '把这两个形象作为阅读的提示。稳固的山体与变化的倒影，如何让人想到离开之后记住一个地方的不同方式？',
          ],
        },
      },
      {
        id: 'fish-tail-lodge-return',
        title: { en: 'Bringing a view home', zh: '把一处风景带回去' },
        scene: 'earth-return',
        body: {
          en: [
            'For this final stop, consider what a moment of stillness contributes to a journey. Looking outward can also make a traveler aware of expectations brought from home.',
            'Write a closing note connecting this lakeside setting with one earlier chapter. Choose a shared question about water, memory, or belonging, and explain how the second place changes your understanding of the first.',
          ],
          zh: [
            '在最后一站，想想片刻安静能为旅程带来什么。看向外部世界，也可能让旅行者意识到自己从家乡带来的期待。',
            '写一段结束语，把这处湖畔与前面某一章联系起来。选择一个关于水、记忆或归属的共同问题，再说明后一个地方怎样改变了你对前一个地方的理解。',
          ],
        },
      },
    ],
    sources: [
      { title: 'Nepal Tourism Board · Pokhara', url: 'https://ntb.gov.np/pokhara' },
      { title: 'ICOMOS Nepal · Architectural and Industrial Heritage Inventory', url: 'https://icomosnepal.org.np/public/storage/download/2025/01/2182-inventory-of-19th-and-20th-architectural-and-industrial-heritage-of-nepal_1st-revision_icomos-nepal_2020.pdf' },
    ],
  },
};

export default guides;
