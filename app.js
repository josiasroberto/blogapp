//Carregando módulos
  const express = require('express')
  const handlebars = require('express-handlebars')
  const app = express()
  const admin = require('./routes/admin')
  const path = require('path')
  const mongoose = require('mongoose')
  const session = require('express-session')
  const flash = require('connect-flash')

  const Postagem = require('./models/Postagem')
  const Categoria = require('./models/Categoria')
  

//Configurações
    //Sessão
      app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
      }))

      app.use(flash())

    //Middleware
      app.use((req, res, next)=>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
      })


  
    app.use(express.urlencoded({extended: true}))
    app.use(express.json())

  //Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

  //Mongoose
    mongoose.connect('mongodb://localhost/blogapp').then(()=>{
      console.log("Conectado ao mongo")
    }).catch((err)=>{
      console.log("Erro ao se conectar: "+ err)
    })

  //Public (pasta de arquivos estáticos)
    app.use(express.static(path.join(__dirname, '/public')))

 
//Rotas
  app.get('/',(req, res) =>{
    Postagem.find().populate('categoria').lean().sort({data:'desc'}).then((postagens) =>{
      res.render('./index', {postagens: postagens})

    }).catch((err)=>{
      req.flash('error_msg','Houve um erro interno')
      res.redirect('/404')
    })
  })

  app.get('/postagem/:slug',(req, res) =>{
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) =>{
      if(postagem){
        res.render('./postagem/index', {postagem: postagem})
      }else{
        req.flash('error_msg','Esta postagem não existe')
        res.redirect('/')
      }
    }).catch((err)=>{
      req.flash('error_msg','Houve um erro interno')
      res.redirect('/')
    })
  })

  app.get('/categorias',(req, res) =>{
    Categoria.find().lean().then((categorias) =>{
      Postagem.find().populate('categoria').lean().then((postagens) =>{
        res.render('./categorias/index', {categorias: categorias, postagens: postagens})
      })        
    }).catch((err) =>{
      req.flash('error_msg','Houve um erro ao listar as categorias!' + err)
      res.redirect('/')
    })
  })

  app.get('/categorias/:slug',(req, res) =>{
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) =>{
      if(categoria){
        Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{
          res.render('./categorias/postagens', {postagens: postagens, categoria: categoria})
        }).catch((err) =>{
          req.flash('error_msg','Houve um erro ao listar os posts!')
          res.redirect('/')
        })
      }else{
        req.flash('error_msg','Esta categoria não existe!')
      }
    }).catch((err) =>{
      req.flash('error_msg','Houve um erro interno ao carregar a página desta categoria!')
      res.redirect('/')
    })
  })

  app.get('/404',(req, res) =>{
    res.send('Erro 404!')
  })

  app.use('/admin',admin)
//Outros
const PORT = 8081
app.listen(PORT,()=>{
  console.log("Server running on port " + PORT)
})