const express = require('express')
const router = express.Router()

const Categoria = require('../models/Categoria')
const Postagem = require('../models/Postagem')

router.get('/',(req,res)=>{
  res.render("./admin/index")
})

router.get('/posts',(req, res)=>{
  res.send("Página de posts")
})

router.get('/categorias',(req, res)=>{
  Categoria.find().sort({date:'desc'}).lean().then((categorias)=>{
    res.render("./admin/categorias",{categorias: categorias})
  }).catch((err)=>{
    req.flash("error_msg","Houve um erro ao listar as categorias!")
    res.redirect("/admin")
  })
})

router.get('/categorias/add',(req, res)=>{
  res.render("./admin/addcategorias")
})

router.post('/categorias/nova',(req, res)=>{
  
  var erros = [] 

  if(!req.body.nome || 
    typeof req.body.nome == undefined ||
    req.body.nome == null){
      erros.push({texto: "Nome inválido!"})
  }
  
  if(!req.body.slug || 
    typeof req.body.slug == undefined ||
    req.body.slug == null){
      erros.push({texto: "Slug inválido!"})
  }

  if(req.body.nome.length < 2){
    erros.push({texto: "Nome da categoria muito pequeno!"})
  }

  if(erros.length > 0){
    res.render('admin/addcategorias',{erros: erros, req: req})
  }else{
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }
  
    new Categoria(novaCategoria).save().then(()=>{
      console.log("Categoria salva com sucesso!")
      req.flash('success_msg', 'Categoria criada com sucesso!')
      res.redirect("/admin/categorias")
    }).catch((err)=>{
      req.flash('error_msg', 'Erro ao salvar categoria!')
      console.log("Erro ao salvar! "+err)
      res.redirect("/admin")
    })
    
  }
   
})

router.get('/categorias/edit/:id',(req, res)=>{
  Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
    res.render('./admin/editcategorias', {categoria: categoria})
  }).catch((err)=>{
    req.flash('error_msg', 'Esta categoria não existe!')
    res.redirect('/admin/categorias')
  })
  

})

router.post('/categorias/edit',(req, res)=>{
  var erros = [] 

  if(!req.body.nome){
      erros.push({texto: "Nome inválido!"})
  }
  
  if(!req.body.slug){
      erros.push({texto: "Slug inválido!"})
  }

  if(req.body.nome.length < 2){
    erros.push({texto: "Nome da categoria muito pequeno!"})
  }

  if(erros.length > 0){
    Categoria.findOne({_id:req.body.id}).lean().then((categoria)=>{
            
     res.render('./admin/editcategorias',{erros: erros, categoria: categoria})
    })
  }else{

    Categoria.findOne({_id:req.body.id}).then((categoria)=>{
      
      categoria.nome = req.body.nome
      categoria.slug = req.body.slug

      categoria.save().then(()=>{
        req.flash('success_msg','Categoria editada com sucesso!')
        res.redirect('/admin/categorias')
      }).catch((err)=>{
        req.flash('error_msg','Houve um erro interno ao salvar a edição da categoria!')
        res.redirect('/admin/categorias')
      })

    }).catch((err)=>{
      req.flash('error_msg','Houve um erro ao editar a categoria!' + err)
      res.redirect('/admin/categorias')
    })
    


    
  }




})

router.post('/categorias/deletar',(req, res)=>{
  Categoria.deleteOne({_id: req.body.id}).then(() => {
    req.flash('success_msg','Categoria deletada com sucesso!')
    res.redirect('/admin/categorias')
  }).catch((err)=>{
    req.flash('error_msg','Houve um erro ao deletar a categoria!')
    res.redirect('/admin/categorias')
  })
})

//----------POSTAGENS----------

router.get('/postagens', (req, res) =>{

  Postagem.find().lean().populate('categoria').sort({data:'desc'}).then((postagens) =>{
    res.render('./admin/postagens', {postagens: postagens})
    
  }).catch((err)=>{
    req.flash('error_msg','Houve um erro ao listar as mensagens!')
    res.redirect('/admin')
  })

})

router.get('/postagens/add', (req, res) =>{
  Categoria.find().lean().then((categorias)=>{
    res.render('./admin/addpostagem',{categorias: categorias})
  }).catch((err)=>{
    req.flash('error_msg','Houve um erro ao carregar o formulário!')
    res.redirect('/admin')
  })
})

router.post('/postagens/nova',(req, res) =>{
  var erros = []

  if(!req.body.titulo){
    erros.push({texto: "Titulo inválido!"})
  }

  if(!req.body.slug){
    erros.push({texto: "Slug inválido!"})
  }

  if(!req.body.descricao){
    erros.push({texto: "Descricao inválida!"})
  }

  if(!req.body.conteudo){
    erros.push({texto: "Conteudo inválido!"})
  }

  if(req.body.titulo.length < 2){
    erros.push({texto: "Título muito pequeno!"})
  }

  if(req.body.descricao.length < 5){
    erros.push({texto: "Descrição muito pequena!"})
  }

  if(req.body.conteudo.length < 10){
    erros.push({texto: "Conteúdo muito pequeno!"})
  }

  if(req.body.categoria == '0'){
    erros.push({texto: "Categoria inválida, registre uma categoria!"})
  }


  if(erros.length > 0){
    Categoria.find().lean().then((categorias)=>{
      res.render('./admin/addpostagem', {erros: erros, categorias: categorias, req: req})
    })
  }else{
    const novaPostagem ={
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria
    }

    new Postagem(novaPostagem).save().then(()=>{
      req.flash('success_msg','Postagem criada com sucesso!')
      res.redirect('/admin/postagens')
    }).catch((err)=>{
      req.flash('error_msg','Houve um ao salvar a postagem!')
      res.redirect('/admin/postagens')
    })
  }




})

router.get('/postagens/edit/:id',(req, res) =>{

  Postagem.findOne({_id:req.params.id}).lean().then((postagem) =>{

    Categoria.find().lean().then((categorias) =>{
      res.render('./admin/editpostagens', {categorias: categorias, postagem: postagem})

    }).catch((err) =>{
      req.flash('error_msg','Houve um erro ao listar as categorias')
      res.redirect('/admin/postagens')
    })

  }).catch((err)=>{
    req.flash('error_msg','Houve um erro ao carregar o formulário de edição')
    res.redirect('/admin/postagens')
  })

})

router.post('/postagens/edit', (req, res) =>{
  var erros = []

  if(!req.body.titulo){
    erros.push({texto: "Titulo inválido!"})
  }

  if(!req.body.slug){
    erros.push({texto: "Slug inválido!"})
  }

  if(!req.body.descricao){
    erros.push({texto: "Descricao inválida!"})
  }

  if(!req.body.conteudo){
    erros.push({texto: "Conteudo inválido!"})
  }

  if(req.body.titulo.length < 2){
    erros.push({texto: "Título muito pequeno!"})
  }

  if(req.body.descricao.length < 5){
    erros.push({texto: "Descrição muito pequena!"})
  }

  if(req.body.conteudo.length < 10){
    erros.push({texto: "Conteúdo muito pequeno!"})
  }

  if(req.body.categoria == '0'){
    erros.push({texto: "Categoria inválida, registre uma categoria!"})
  }


  if(erros.length > 0){
    Postagem.findOne({_id:req.body.id}).lean().then((postagem) =>{
      Categoria.find().lean().then((categorias)=>{
        res.render('./admin/editpostagens', {erros: erros, categorias: categorias, postagem: postagem})
      })
    })
     }else{
    Postagem.findOne({_id: req.body.id}).then((postagem) =>{
      postagem.titulo = req.body.titulo
      postagem.slug = req.body.slug
      postagem.descricao = req.body.descricao
      postagem.conteudo = req.body.conteudo
      postagem. categoria = req.body.categoria

      postagem.save().then(()=>{
        req.flash('success_msg','Postagem editada com sucesso!')
        res.redirect('/admin/postagens')
      }).catch((err) =>{
        req.flash('error_msg','Erro interno!')
        res.redirect('/admin/postagens')
      })

    }).catch((err) =>{
      req.flash('error_msg','Houve um erro ao salvar a edição!')
      res.redirect('/admin/postagens')
    })
     }
})

router.get('/postagens/deletar/:id', (req, res) =>{
  Postagem.remove({_id: req.params.id}).then(() =>{
    req.flash('success_msg','Postagem deletada com sucesso!')
    res.redirect('/admin/postagens')
  }).catch((err)=>{
    req.flash('error_msg','Houve um erro interno!')
    res.redirect('/admin/postagens')
  })
})



module.exports =router