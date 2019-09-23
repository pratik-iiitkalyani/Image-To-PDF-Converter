// Declared all our imports
const express = require('express')
const app = express()
const fs = require('fs')
const multer = require('multer')
const {TesseractWorker} = require('tesseract.js')
const worker = new TesseractWorker()

// Storage
const storage = multer.diskStorage({
	destination:(req, file, cb) => {
		cb(null, "./uploads")
	}, 
	filename:(req,file, cb) => {
		cb(null, file.originalname)
	} 
})

const uploads = multer({storage:storage}).single("pratik")

app.set("view engine", "ejs")
app.use(express.static('public'))

//Routes

app.get('/', (req, res) => {
	res.render('index')
})


// uploads
app.post('/upload', (req,res) => {
	uploads(req, res, err => {
		console.log(req.file)
		fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
			if(err) return console.log('err', err)

			worker
			.recognize(data, 'eng',{tessjs_create_pdf : "1"})
			.progress(progress => {
				console.log(progress)
			})
			.then(result => {
				// res.send(result.txt) 
				res.redirect('/downloads')
			})
			.finally(() => worker.terminate());
		})
	})
})

app.get('/downloads', (req,res) =>{
	const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
	res.download(file)
})

// start up our Server
const PORT = 1111 || process.env.PORT

app.listen(PORT, (req, res) => {
	console.log(`server running on port ${PORT}`);
});