
const puppeterr = require("puppeteer");
const fs = require('fs');
const https = require('https');
const { v4: uuidv4 } = require('uuid');
const Category = require("../schema/category.schema");
const Items = require("../schema/item.schema");
const Versions = require("../schema/oldversion.schema");
//const download = require('image-downloader')
const download = (url, destination) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(destination);

  https.get(url, response => {
    response.pipe(file);

    file.on('finish', () => {
      file.close(resolve(true));
    });
  }).on('error', error => {
    fs.unlink(destination);

    reject(error.message);
  });
});
const getCategory = async (url) => {
  const browser = await puppeterr.launch({ headless: false });
  const pg = await browser.newPage();
  await pg.setDefaultNavigationTimeout(0);
  await pg.goto(url)
  const data = await pg.evaluate(async () => {

    let data = Array.from(document.querySelectorAll(".menu_head1")).map(value => (
      {
        name: value.textContent,
        path: `/root/${value.textContent}`,
        children: []
      }
    ))
    data[0].name = data[0].name.slice(2)
    data[1].name = data[1].name.slice(1)
    const belongtoGame = Array.from(document.querySelectorAll(".box .menu_list div ul")).map(value => (
      {
        list: Array.from(value.querySelectorAll("li a")).map(index => (
          {
            name: index.textContent,

          }
        ))
      }
    ))
    return ({ Parentcategory: data, listCategory: belongtoGame });
  })
  await browser.close();
  return data
}
const getLinkDownLoadOld = async (url) => {
  const browser = await puppeterr.launch({ headless: false });
  const pg = await browser.newPage();
  await pg.setDefaultNavigationTimeout(0);
  await pg.goto(url)
  const data = await pg.evaluate(async () => {
    let newaray = []
    const data = Array.from(document.querySelectorAll(".table .table-row"))
    for (let i = 1; i < data.length; i++) {
      let newobject =

      {
        dayUpdate: data[i].querySelector(".table-cell .light-black ").textContent,
        architecture: data[i].querySelectorAll(".dowrap")[1].textContent,
        MinimumVersion: data[i].querySelectorAll(".dowrap")[2].textContent,
        ScreenDPI: data[i].querySelectorAll(".dowrap")[3].textContent,
        link: data[i].querySelector(".down a").getAttribute("href")

      }
      newaray.push(newobject)
    }

    return (newaray);
  })
  await browser.close();
  return data
}
const getVerrsion = async (url) => {
  const browser = await puppeterr.launch({ headless: false });
  const pg = await browser.newPage();
  await pg.setDefaultNavigationTimeout(0);
  await pg.goto(url)
  const data = await pg.evaluate(async () => {

    const data = Array.from(document.querySelectorAll(".ver-wrap li")).map(value => (

      {
        linkdownloadOldVersion: value.querySelector("a").getAttribute("href"),
        name: value.querySelector(".ver-item-n").textContent,
        size: value.querySelector(".ver-item-s").textContent,
        itemId: null,
        apk: Array.from(value.querySelectorAll(".ver-item-t")).map(value => (
          value.textContent
        )),

      }
    ))


    return (data);
  })
  await browser.close();
  return data
}
const getdetail = async (url) => {
  const browser = await puppeterr.launch({ headless: false });
  const pg = await browser.newPage();
  await pg.setDefaultNavigationTimeout(0);
  await pg.goto(url)
  // await pg.waitForNavigation({ waitUntil: 'networkidle2' });
  const data = await pg.evaluate(async () => {

    const data = Array.from(document.querySelectorAll(".describe-whatnew")).map(value => (

      {
        test: value.querySelector("h2").textContent,
      }
    ))
    const Parentcategory = document.querySelector(".bread-crumbs").childNodes[3].textContent
    const sub = document.querySelector(".bread-crumbs").childNodes[5].textContent
    const linkdownloadnotfull = document.querySelector(".ny-down .da").getAttribute("href")
    let linkdownload = `https://apkpure.com${linkdownloadnotfull}`
    let urlversion = null
    let video = null
    let inforUpdate = null
    let addition = null
    let author = null
    let datePublish = null
    let require = null
    let description = null
    try {
      description = document.querySelector(".content").textContent
      addition = Array.from(document.querySelectorAll(".additional ul li p"))
      author = addition[7].textContent
      datePublish = addition[5].textContent
      require = addition[11].textContent
      inforUpdate = document.querySelector(".describe-whatnew").childNodes[5].textContent
      urlversion = document.querySelector(".ny-versions").getAttribute("href")
      video = document.querySelector(".details-tube").getAttribute("data-src")
    } catch (error) {
    }
    const listImage = Array.from(document.querySelectorAll(".amagnificpopup .mpopup img")).map(value => (
      { image: value.getAttribute("src") }
    ))

    return ({ Parentcategory, sub, urlversion, listImage, video, inforUpdate, author, require, description, linkdownload, datePublish });
  })
  await browser.close();
  return data
}
recursive = async (url, SetNumberPage) => {
  const browser = await puppeterr.launch({ headless: false });
  const pg = await browser.newPage();
  await pg.setDefaultNavigationTimeout(0);
  await pg.goto(url)
  let nextPage = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;

  const data = await pg.evaluate(async () => {
    let array = []
    const data1 = Array.from(document.querySelectorAll(".editors_m"))

    for (let i = 0; i < data1.length; i++) {
      let name = data1[i].querySelector(".editors_m_2 .editors_title a").textContent
      let url = data1[i].querySelector(".editors_m_2 .editors_title a").getAttribute("href")
      let avatar = data1[i].querySelector(".editors_m_1 p a img").getAttribute("src")
      let currentVersion = data1[i].querySelector(".editors_m_2 .editors_title a .vname").textContent

      array.push({ name, avatar, currentVersion, url })
    }

    return array;
  })
  if (SetNumberPage === nextPage) {

    await browser.close();
    return data
  } else {

    const nextUrl = `https://apkpure.com/vn/discover?page=${nextPage}`
    await browser.close();
    return data.concat(await recursive(nextUrl, SetNumberPage))
  }
}
module.exports = {
  getdata: async (req, res, next) => {
    let url = "https://apkpure.com/vn/discover?page=2"
    try {

      let data = await recursive(url, 3)
      // let listINforOldVersion = null

      for (let i = 0; i < data.length; i++) {
        let newurl = `https://apkpure.com${data[i].url}`
        let result = await getdetail(newurl)
        // console.log("result", result);
        // let merge 2object
        data[i] = Object.assign({}, data[i], result)
        // create Category
        const existsubCategory = await Category.findOne({ name: result.sub })
        if (!existsubCategory) {
          const newCategory = new Category({ name: result.sub })
          await newCategory.save()
          data[i].sub = newCategory._id
        } else {
          data[i].sub = existsubCategory._id
        }
        const existParentCategory = await Category.findOne({ name: result.Parentcategory })

        if (!existParentCategory) {
          const newCategory = new Category({ name: result.Parentcategory })
          await newCategory.save()

          data[i].Parentcategory = newCategory._id
        } else {

          data[i].Parentcategory = existParentCategory._id
        }



        //get list old version

        //download image and config listimage
        let newaray = []
        for (let i = 0; i < result.listImage.length; i++) {
          let IdImage2 = uuidv4();
          await download(result.listImage[i].image, `./public/images/${IdImage2}.png`);
          newaray.push(`/images/${IdImage2}.png`)
        }
        data[i].listImage = newaray

        //download avatar and config avatar
        let IdImage = uuidv4();
        await download(data[i].avatar, `./public/images/${IdImage}.png`);
        data[i].avatar = `/images/${IdImage}.png`


        const existitem = await Items.findOne({ name: data[i].name })
        if (!existitem) {
          const newitem = new Items(data[i])
          await newitem.save()
        }

      }

      res.json({ data: data })
    } catch (error) {
      console.log(error);

    }

  },
  getCategory: async (req, res, next) => {
    let data = await getCategory("https://apkpure.com/vn/game")
    let childrenGame = []
    let childrenApp = []
    let parentAll = []
    for (let i = 0; i < data.listCategory[0].list.length; i++) {
      data.listCategory[0].list[i].path = `root/game/${data.listCategory[0].list[i].name}`

    }
    for (let i = 0; i < data.listCategory[1].list.length; i++) {
      data.listCategory[1].list[i].path = `root/app/${data.listCategory[1].list[i].name}`

    }
    let insertCategorygame = await Category.insertMany(data.listCategory[0].list)
    let insertCategoryapp = await Category.insertMany(data.listCategory[1].list)
    for (let i = 0; i < insertCategorygame.length; i++) {
      childrenGame.push(insertCategorygame[i]._id)
    }
    for (let i = 0; i < insertCategoryapp.length; i++) {
      childrenApp.push(insertCategoryapp[i]._id)
    }
    data.Parentcategory[0].children = childrenGame
    data.Parentcategory[1].children = childrenApp

    let InsertParentGame = await Category.insertMany(data.Parentcategory)
    const existRoot = await Category.findOne({ name: "root" })
    for (let i = 0; i < InsertParentGame.length; i++) {
      parentAll.push(InsertParentGame[i]._id)
    }

    if (!existRoot) {
      let root = new Category({ name: "root", isRoot: true, path: "/root", children: parentAll })
      await root.save()
    }
    res.json({ insertCategorygame, insertCategoryapp, InsertParentGame })
  },
  getLinkAndoldversion: async (req, res, next) => {
    const listOfItemNotFinish = await Items.find({ finish: false }).limit(3)
    if (listOfItemNotFinish.length === 0) {
      return res.json({ msg: "all item up to date" })
    }
    let id = null
    for (let i = 0; i < listOfItemNotFinish.length; i++) {

      id = listOfItemNotFinish[i]._id
      if (listOfItemNotFinish[i].urlversion !== null) {
        let listINforOldVersion = await getVerrsion(`https://apkpure.com${listOfItemNotFinish[i].urlversion}`)

        for (let j = 0; j < listINforOldVersion.length; j++) {
          if (listINforOldVersion[j].linkdownloadOldVersion.slice(listINforOldVersion[j].linkdownloadOldVersion.length - 7, listINforOldVersion[j].linkdownloadOldVersion.length) !== "version") {
            let newurlfordownload = listINforOldVersion[j].linkdownloadOldVersion
            // listINforOldVersion[j].linkdownloadOldVersion = []
            console.log("run again");
            let arraylinkdownload = await getLinkDownLoadOld(`https://apkpure.com${newurlfordownload}`)
            console.log("aray", arraylinkdownload, typeof arraylinkdownload);
            listINforOldVersion[j].linkdownloadOldVersion = arraylinkdownload
            listINforOldVersion[j].itemId = id

          }
          listINforOldVersion[j].linkdownloadOldVersion = {
            link: listINforOldVersion[j].linkdownloadOldVersion
          }

          listINforOldVersion[j].itemId = id
        }

        const insertmany = await Versions.insertMany(listINforOldVersion)
      }
      const listOfItemUpdate = await Items.findByIdAndUpdate(listOfItemNotFinish[i]._id, { finish: true }, {
        useFindAndModify: false,
        new: true,
        runValidators: true
      })
      console.log(listOfItemUpdate);
    }

    res.json({ msg: "successful", listOfItemNotFinish })
  }
}