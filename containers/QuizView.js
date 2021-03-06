import React, { Component } from 'react'
import { Text, View, Button, Switch } from 'react-native'
import { connect } from 'react-redux'

import { CardView, ContainerView, viewStyles } from '../components/Views'
import { gray, white, red, blue } from '../utils/colours'
import { setLocalNotification, clearLocalNotification } from '../utils/notifications'

class QuizView extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: navigation.state.params.title || `Start Quiz for ${navigation.state.params.deckTitle}`
    })

    state = {
        questionIndex: -1,
        correctCount: 0,
        showAnswer: false,
    }

    _onUpdateTitle = ({ questionIndex, questionCount, navigation, correctAnswer = false }) => () => {
        if (correctAnswer) {
            this.setState({ correctCount: this.state.correctCount + 1 })
        }
        this.setState({ questionIndex, showAnswer: false })
        navigation.setParams({
            title: `Question ${Math.min(questionIndex + 1, questionCount)}/${questionCount}`,
        })
    }

    _onToggleShowAnswer = value => { this.setState({ showAnswer: value }) }

    render() {
        const { questionIndex, correctCount, showAnswer } = this.state
        const { questions, navigation } = this.props
        const questionCount = questions.length

        // beginning of the quiz
        if (questionIndex === -1) {
            return (
                <View style={[{ justifyContent: 'center', }, viewStyles.container]}>
                    <Button title='I want to take the quiz now' color={red}
                        onPress={this._onUpdateTitle({ questionIndex: questionIndex + 1, questionCount, navigation })} />
                </View >
            )
        }

        // end of the quiz
        if (questionIndex === questionCount) {
            // reset the local notification
            clearLocalNotification().then(setLocalNotification)

            return (
                <View style={[{ marginLeft: 10, marginRight: 10, }, viewStyles.container]}>
                    <Text style={{ fontSize: 20, textAlign: 'center' }}>You answered {correctCount / questionCount * 100}% of questions correctly.</Text>
                    <Button title='Start over' color={red}
                        onPress={() => navigation.navigate('QuizView', { deckTitle: navigation.state.params.deckTitle })} />
                    <Button title='Back to deck' color={red}
                        onPress={() => navigation.navigate('DeckView', { title: navigation.state.params.deckTitle })} />
                </View>
            )
        }

        // during the quiz
        return (
            <ContainerView>
                <CardView>
                    <Text>{questions[questionIndex].question}</Text>
                </CardView>
                <View style={{ alignItems: 'center', margin: 20 , height: 100 }}>
                    <Text style={{ fontSize: 20, marginBottom: 10 }}>Show Answer</Text>    
                    <Switch onValueChange={this._onToggleShowAnswer} value={showAnswer}
                        thumbTintColor={red} tintColor={gray} onTintColor={blue} />    
                    {showAnswer && <Text style={{ fontSize: 20, color: gray, marginTop: 10 }}>{questions[questionIndex].answer}</Text>}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Button title='Correct' color={red}
                        onPress={this._onUpdateTitle({ questionIndex: questionIndex + 1, questionCount, navigation, correctAnswer: true })} />
                    <Button title='Incorrect' color={red}
                        onPress={this._onUpdateTitle({ questionIndex: questionIndex + 1, questionCount, navigation })} />
                </View>
            </ContainerView>
        )
    }
}

const mapStateToProps = ({ entities: { questions } }, { navigation }) => ({
    questions: Object.values(questions).filter(question => question.deck === navigation.state.params.deckTitle),
})

export default connect(mapStateToProps)(QuizView)
