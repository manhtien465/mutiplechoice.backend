const Category = require("../schema/category.schema");
const addChildren = (parent, map) => {

  if (!parent.branches) {
    parent.branches = [];
  }
  // if node has children
  if (parent.children) {

    // foreach child in children
    for (const childID of parent.children) {
      // console.log("childID",childID)
      const child = map[childID]
      const newchild = {
        ...child._doc, branches: []
      }
      parent.branches.push(newchild);
      // add child into parent
      addChildren(newchild, map);

    }
  }
  return parent
}
module.exports = {
  /**
  * @URL /category/create
  * @param {name, path,isRoot,desc,children,parentId}
  */
  add: async (req, res, next) => {
    const { name, path, desc, isRoot, children, parentId } = req.body
    if (isRoot && path !== "/root") {
      return res.status(400).json("path of root must be '/root'")
    }
    try {

      if (isRoot) {
        const rootCategory = await Category.findOne({ isRoot: true })
        if (rootCategory) {
          return res.status(400).json("root adready exist")
        }
      }
      const newCategory = new Category({
        name, path, desc, isRoot, children
      })
      //update children in Parent 
      if (parentId) {

        const updateParent = await Category.findByIdAndUpdate(parentId, {
          $push: {
            children: newCategory._id
          }
        },
          { useFindAndModify: false })

        if (!updateParent) {
          return res.status(400).json("parent not found")
        }
      }
      const result = await newCategory.save()
      res.status(200).json(result)
    } catch (error) {
      return res.status(400).json("error")
    }
  },

  /**
 * @URL /category/update
 * @method put
 * @param {name, path,isRoot,desc,children,parentId}
 */
  update: async (req, res, next) => {
    const { id } = req.body
    const updateCategory = await Category.findByIdAndUpdate(id, {
      $set: req.body
    }, {
      useFindAndModify: false,
      new: true,
      runValidators: true,
    })
    if (!updateCategory) {
      return res.status(400).json(" category not exist")
    }
    return res.json(updateCategory)
  },


  /**
* @URL /category/delete:/id
* @method delete
* @param {id}
*/
  delete: async (req, res, next) => {
    const { id } = req.params

    if (id == null || undefined) {
      return res.status(400).json("id is not empty")
    }
    const existCategory = await Category.findById(id)
    if (!existCategory) {
      return res.status(400).json(" category not exits")
    }
    //find child in children to remove
    //    const child= await Category.findOne({children:{"$in":[id]}})
    //    console.log(child);
    //    if(child){

    //        const updateParent =await Category.findByIdAndUpdate(child,{
    //         $pull: {
    //             children: id
    //         },
    //        },{useFindAndModify:false})
    //    }

    await existCategory.remove()
    res.status(200).json({ category: existCategory, msg: "successful" })
  },

  /**
* @URL /category/get
* @method get
*/
  get: async (req, res, next) => {
    const result = await Category.find().sort({ path: 1 })
    console.log(result);
    const map = {}
    result.map((index) => {
      map[index._id] = index
    })

    const root = result[0];
    const rootID = {
      ...root._doc, branches: []
    }


    const tree = addChildren(rootID, map);
    res.json(tree)
  },


  /**
* @URL /category/get-sub/:id
* @method get
* @param {id}
*/
  getSub: async (req, res, next) => {

    const { id } = req.params
    Category.findOne({ _id: id })

      .exec((err, docs) => {
        console.log(docs);
        if (err) {
          return res.status(400).json({ msg: "Error" })
        }
        if (!docs) {
          //return res.status(400).json(" not found ")
          return res.status(400).json({ msg: "category not found" })
        }
        // takes a collection and a document id and returns this document fully nested with its children
        const populateChildren = (coll, id) => {

          return coll.findById({ _id: id })
            .then((page) => {

              if (!page.children || !page.children.length) {
                return page;
              }
              const newpage = {
                ...page._doc
              }

              return Promise.all(page.children.map((childId) => populateChildren(coll, childId)))
                .then((children) => {
                  Object.assign(newpage, { branches: children })
                  return newpage
                })
            });
        }
        Promise.all(docs.children.map((doc) => {
          return populateChildren(Category, doc);
        })).then((doc) => {

          res.json({
            doc
          });
        });
      });
  },

  /**
* @URL /category/set-order
* @method put
* @param {id ,parentId}
*/
  setOrder: async (req, res, next) => {
    const { id, children } = req.body
    const existCategory = await Category.findById(id)
    if (!existCategory) {
      return res.status(400).json("category not found")
    }
    const updateCategory = await Category.findByIdAndUpdate(id, { children },
      {
        useFindAndModify: false,
        new: true,
        runValidators: true,
      })
    res.json(updateCategory);
  },


  /**
 * @URL /category/update-parent
 * @method put
 * @param { oldParent,newParent,id}
 */
  updateParent: async (req, res, next) => {
    const { newParentId, oldParentId, id, } = req.body
    const category = await Category.findById(id)
    if (!category) {
      throw new BadRequestError("category not found")
    }
    const newParent = await Category.findById(newParentId)
    if (!newParent) {
      throw new BadRequestError("new parent category not found")
    }
    const oldParent = await Category.findById(oldParentId)
    if (!oldParent) {
      throw new BadRequestError("old parent category not found")
    }

    //add in new parent
    const updateParent = await Category.findByIdAndUpdate(newParentId, {
      $push: {
        children: category._id
      }
    }, {
      useFindAndModify: false,
      new: true,
      runValidators: true,
    })

    //delete in oldParent
    const deleteParentold = await Category.findByIdAndUpdate(oldParentId, {
      $pull: {
        children: category._id
      }
    }, {
      useFindAndModify: false,
      new: true,
      runValidators: true
    });
    //update path fot child
    const child = await Category.findByIdAndUpdate(id, {
      path: `${updateParent.path}/${category.name}`
    }, {
      useFindAndModify: false,
      new: true,
      runValidators: true
    });
    res.json({ parent: updateParent, child: child })
  }
}