const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
var cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express()

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

const Schema = mongoose.Schema;

const url = `https://one2ayusharikar-gmail-com-cuvette-final-ha81.onrender.com`; 
const interval = 30000; 

function reloadWebsite() {
  axios.get(url)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
    });
}


setInterval(reloadWebsite, interval);

const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
})

const optionSchema = new mongoose.Schema({
  text: { type: String, },
  imageUrl: { type: String }
});



const questionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  options: [optionSchema],
  correctOption: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  timer: { type: String, default: 'OFF' }, // Default value 0 represents "OFF"
  optionCount: { type: Number, required: true },
  selectedOptionType: { type: String, required: true },
  correctCount: {type: Number, default:0},
  wrongCount: {type: Number, default:0},
});

const QuizSchema = new mongoose.Schema({
  quizTitle: { type: String, required: true },
  questions: { type: [questionSchema], required: true },
  impressions: {type:Number, default:0},
  quizType: {type: String, required: true },
  correctAnswerCount: {type: Number, default:0},
  wrongAnswerCount: {type: Number, default:0},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

});

const Quiz = mongoose.model('Quiz', QuizSchema);

const pollOptionSchema = new mongoose.Schema({
  text: { type: String },
  imageUrl: { type: String },
  view: {type: Number, default:0}
});

const pollQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  options: [pollOptionSchema],
  optionCount: { type: Number, required: true },
  selectedOptionType: { type: String, required: true },
  slectedOption: {type: String},
  
});

const PollSchema = new mongoose.Schema({
  quizTitle: { type: String, required: true },
  questions: { type: [pollQuestionSchema], required: true },
  impressions: {type:Number, default:0},
  quizType: {type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

});

const Poll = mongoose.model('Poll', PollSchema);



const isUserLoggedIn = (req, res, next) => {
  try {
    const user = jwt.verify(req.headers.token, process.env.JWT_PRIVATE_KEY);
    req.user = user
    next()
  } catch(error) {
    return res.json({
      message: "You've not logged in! Please log in first!"
    })
  }
}




// PUBLIC ROUTES
app.get('/', (req, res) => {
  res.json({
    status: 'Server is up :)',
    now: new Date()
  })
})

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      status: 'SUCCESS',
      data: users
    })
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      message: 'Something went wrong'
    })
  }
})

app.get('/takeQuiz/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log(token)
    const quiz = await Quiz.findById(token);

    if (!quiz) {
      return res.status(404).json({
        status: 'FAILED',
        message: 'Quiz not found',
      });
    }

    quiz.impressions +=1;
    quiz.save();

    res.json({
      status: 'SUCCESS',
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    // res.status(500).json({
    //   status: 'FAILED',
    //   message: 'Something went wrong',
    //   error: error.message || error,
    // });
  }
});

app.get('/takePoll/:token', async (req, res) => {
  try {
      const poll = await Poll.findById(req.params.token);
      if (!poll) {
          return res.status(404).send('Poll not found');
      }
      poll.impressions+=1;
      poll.save()
      res.json({ data: poll });
  } catch (error) {
      console.error('Error fetching poll data:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/editModal/:token', async (req, res) => {
  try {
      const poll = await Poll.findById(req.params.token);
      if (!poll) {
          return res.status(404).send('Poll not found');
      }
      res.json({ data: poll });
  } catch (error) {
      console.error('Error fetching poll data:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.put('/updateQuestionViewCount/:pollId/:questionIndex', async (req, res) => {
  try {
      const { pollId, questionIndex } = req.params;
      const { selectedOption } = req.body;

      const poll = await Poll.findById(pollId);
      if (!poll) return res.status(404).send('Poll not found');

      const question = poll.questions[questionIndex];
      const option = question.options.find(opt => opt.text === selectedOption || opt.imageUrl === selectedOption);

      if (option) {
          option.view += 1;
          await poll.save();
          res.json({ success: true });
      } else {
          res.status(404).send('Option not found');
      }
  } catch (error) {
      res.status(500).send('Server Error');
  }
});

app.put('/users/updateQuiz/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { quizTitle, questions, quizType } = req.body;

     
      const updatedQuiz = await Quiz.findByIdAndUpdate(
          id,
          {
              quizTitle,
              questions,
              quizType
          },
          { new: true } 
      );

      if (!updatedQuiz) {
          return res.status(404).json({ error: 'Quiz not found' });
      }

      res.status(200).json({ message: 'Quiz updated successfully', updatedQuiz });

  } catch (error) {
      console.error('Error updating quiz:', error);
      res.status(500).json({ error: 'An error occurred while updating the quiz' });
  }
});

app.put('/users/updatePoll/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { quizTitle, questions, quizType } = req.body;

     
      const updatedPoll = await Poll.findByIdAndUpdate(
          id,
          {
              quizTitle,
              questions,
              quizType
          },
          { new: true } 
      );

      if (!updatedPoll) {
          return res.status(404).json({ error: 'Poll not found' });
      }

      res.status(200).json({ message: 'Quiz updated successfully', updatedPoll });

  } catch (error) {
      console.error('Error updating quiz:', error);
      res.status(500).json({ error: 'An error occurred while updating the quiz' });
  }
});

app.get('/questionAnalysis/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log(token)
    const quiz = await Quiz.findById(token);

    if (!quiz) {
      return res.status(404).json({
        status: 'FAILED',
        message: 'Quiz not found',
      });
    }

    res.json({
      status: 'SUCCESS',
      data: quiz,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    // res.status(500).json({
    //   status: 'FAILED',
    //   message: 'Something went wrong',
    //   error: error.message || error,
    // });
  }
});

app.get('/pollAnalysis/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log(token)
    const poll = await Poll.findById(token);

    if (!poll) {
      return res.status(404).json({
        status: 'FAILED',
        message: 'Quiz not found',
      });
    }

    res.json({
      status: 'SUCCESS',
      data: poll,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    // res.status(500).json({
    //   status: 'FAILED',
    //   message: 'Something went wrong',
    //   error: error.message || error,
    // });
  }
});


app.get('/users/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({});
    res.json({
      status: 'SUCCESS',
      data: quizzes,
    });
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      message: 'Something went wrong while fetching quizzes',
      error: error.message || error,
    });
  }
});

app.get('/users/polls', async (req, res) => {
  try {
    const polls = await Poll.find({});
    res.json({
      status: 'SUCCESS',
      data: polls,
    });
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      message: 'Something went wrong while fetching quizzes',
      error: error.message || error,
    });
  }
});

app.post('/users/createQuiz', async (req, res) => {
  try {
    const { quizTitle, questions, quizType } = req.body;
    console.log('Received data:', { quizTitle, questions, quizType });

    // Validate required fields
    if (!quizTitle || !questions || !Array.isArray(questions)) {
      console.log('Validation failed: Missing quizTitle or questions');
      return res.status(400).json({ error: 'Quiz title and questions are required' });
    }

    // Create the quiz in the database
    const quiz = new Quiz({ quizTitle, questions, quizType });
    await quiz.save();  // Using save to capture any schema validation errors
    console.log('Quiz created successfully:', quiz);

    res.json({
      status: 'SUCCESS',
      message: 'Quiz created successfully',
      data: quiz,  // Optionally return the created quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error.message || error);
    res.status(500).json({
      status: 'FAILED',
      message: 'Something went wrong',
      error: error.message || error,  // Include error details in the response for debugging
    });
  }
});

app.post('/users/createPoll', async (req, res) => {
  try {
    const { quizTitle, questions, quizType } = req.body;
    console.log('Received data:', { quizTitle, questions, quizType });

    // Validate required fields
    if (!quizTitle || !questions || !Array.isArray(questions)) {
      console.log('Validation failed: Missing quizTitle or questions');
      return res.status(400).json({ error: 'Quiz title and questions are required' });
    }

    // Create the quiz in the database
    const poll = new Poll({ quizTitle, questions, quizType });
    await poll.save();  // Using save to capture any schema validation errors
    console.log('Quiz created successfully:', poll);

    res.json({
      status: 'SUCCESS',
      message: 'Quiz created successfully',
      data: poll,  // Optionally return the created quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error.message || error);
    res.status(500).json({
      status: 'FAILED',
      message: 'Something went wrong',
      error: error.message || error,  // Include error details in the response for debugging
    });
  }
});

app.post('/quizResults/:token', async (req, res) => {
  const { token } = req.params;
  console.log(token);
  const { correctAnswers, wrongAnswers } = req.body;
  console.log(correctAnswers,wrongAnswers)

  try {
    const quiz = await Quiz.findById(token);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Update the quiz with the results
    
      quiz.correctAnswerCount += correctAnswers;
      quiz.wrongAnswerCount += wrongAnswers;
    

    await quiz.save();
    res.status(200).json({ message: 'Results updated successfully' });
  } catch (error) {
    console.error('Error updating results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/updateQuestionCount/:quizId/:questionIndex', async (req, res) => {
  try {
      const { quizId, questionIndex } = req.params;
      const { correctCount, wrongCount } = req.body;

      const quiz = await Quiz.findById(quizId);
      if (quiz) {
          quiz.questions[questionIndex].correctCount = correctCount;
          quiz.questions[questionIndex].wrongCount = wrongCount;
          console.log()
          await quiz.save(correctCount, wrongCount);
          res.status(200).send('Question counts updated successfully.');
      } else {
          res.status(404).send('Quiz not found.');
      }
  } catch (error) {
      console.error('Error updating question counts:', error);
      res.status(500).send('Internal server error.');
  }
});

app.put('/updatePollResponse/:quizId/:questionIndex', async (req, res) => {
  try {
      const { quizId, questionIndex } = req.params;
      const { selectedOption } = req.body;

      const poll = await Poll.findById(quizId);
      if (poll) {
          poll.questions[questionIndex].selectedOption = selectedOption;
          poll.questions[questionIndex].options.map(option=>
            {
              if(option.text===selectedOption || option.imageUrl===selectedOption)
                {
                  view+=1
                }
        })
          res.status(200).send('Question counts updated successfully.');
      } else {
          res.status(404).send('Quiz not found.');
      }
  } catch (error) {
      console.error('Error updating question counts:', error);
      res.status(500).send('Internal server error.');
  }
});

app.post('/users/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    const encryptedPassword = await bcrypt.hash(password, 10)

    await User.create({ name, email, password: encryptedPassword } );
    res.json({
      status: 'SUCCESS',
      message: 'User signed up successfully'
    })
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      message: 'Something went wrong'
    })
  }
})

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email }).lean()

    if(!user) {
      return res.json({
        status: 'FAILED',
        message: 'Incorrect credentials. Please try again!'
      })
    }

    console.log(user.password)

    const match =await bcrypt.compare(password, user.password);
    console.log(match)
    if(!match) {
      return res.json({
        status: 'FAILED',
        message: 'Incorrect credentials. Please try again! in login'
      })
    }

    const token = jwt.sign(user, process.env.JWT_PRIVATE_KEY, { expiresIn: '1h' });

    res.json({
      status: 'SUCCESS',
      message: 'User logged in successfully',
      token
    })
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      message: 'Something went wrong'
    })
  }
})

app.delete('/users/deleteQuiz/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findByIdAndDelete(id);

    if (!quiz) {
      return res.status(404).json({
        status: 'FAILED',
        message: 'Quiz not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      message: 'Something went wrong',
      error: error.message || error
    });
  }
});

app.delete('/users/deletePoll/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findByIdAndDelete(id);

    if (!poll) {
      return res.status(404).json({
        status: 'FAILED',
        message: 'Quiz not found'
      });
    }

    res.json({
      status: 'SUCCESS',
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'FAILED',
      message: 'Something went wrong',
      error: error.message || error
    });
  }
});

app.listen(4000, () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Server is running :)'))
    .catch((error) => console.log(error))
  })
