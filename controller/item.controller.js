const Item = require("../schema/item.schema")
const puppeterr = require("puppeteer");
const getlinkdownload = async (url) => {
  puppeterr.launch({ headless: false }).then(async browser => {
    const page = await browser.newPage();

    await page.goto(url);

    const reportLink = await page.$('.ny-down .da');

    await reportLink.click({ clickCount: 1, delay: 100 });
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await browser.on('targetcreated', async () => {
      const pageList = await browser.pages();
      pageList.forEach((page) => {
        page._client.send('Page.setDownloadBehavior', {
          behavior: 'allow',
          downloadPath: './down',
        });
      });
    })
  });
}


module.exports = {
  create: async (req, res, next) => {
    const { name } = req.body
    // const item = Item.findOne({ name });
    // console.log(item);
    // if (item) {
    //   return res.status(400).json({ msg: "item have found" });
    // }
    const newItem = new Item({
      ...req.body
    })
    await newItem.save()
    res.json(newItem)
  },
  update: async (req, res, next) => {
    const { id } = req.body
    const updateItem = Item.findByIdAndUpdate(id, {
      ...req.body
    })
    if (!updateItem) {
      return res.status(400).json({ msg: "item not found" })
    }

  },
  gets: async (req, res, next) => {
    res.json(res.advancedResults)

  },
  get: async (req, res, next) => {
    const { id } = req.params

    const exitsItem = await Item.findById(id).populate("sub")
    if (!exitsItem) {
      return res.json({ msg: "ite  not found" })
    }
    res.json(exitsItem)
  },
  delete: async (req, res, next) => {
    const { id } = req.params

    const exitsItem = await Item.findById(id)
    if (!exitsItem) {
      return res.json({ msg: "not found" })
    }
    await exitsItem.remove()
    exitsItem.listImage.map((v, i) => {
      fs.unlink(v, (err) => {
        if (err) {
          return res.status(400).json({ msg: "not found" })
        }
      })
    })

    return res.json({ item: exitsItem, msg: "deleteSuccessful" })

  },
  download: async (req, res, next) => {
    // const { id } = req.body
    // const exitsItem = await Item.findById(id)
    // if (!exitsItem) {
    //   return res.json({ msg: "not found" })
    // }
    const url = await getlinkdownload("https://apkpure.com/vn/litmatch%E2%80%94make-new-friends/com.litatom.app/download?from=details")
    return res.json({ linkdownload: url })
  }
}