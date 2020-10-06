import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, Button, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Input, Rating } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment, deleteFavorite } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment)),
    deleteFavorite: (dishId) => dispatch(deleteFavorite(dishId))
})

class Dishdetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            author: '',
            rating: 3,
            comment: '',
            showModal: false
        };
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    toggleModal() {
        this.setState({ showModal: !this.state.showModal })
    }

    submitComment() {
        this.props.postComment(this.props.navigation.getParam('dishId', ''), this.state.rating, this.state.author, this.state.comment);
        this.toggleModal();
        this.setState({
            author: '',
            rating: 3,
            comment: ''
        })
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId', '');
        return (
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                    toggleModal={() => this.toggleModal()}
                    remove={(id) => this.props.deleteFavorite(dishId)}
                />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal animationType={"slide"} transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => this.toggleModal()}
                    onRequestClose={() => this.toggleModal()}>
                    <Rating
                        style={{ margin: 20 }}
                        showRating
                        startingValue={this.state.rating}
                        minValue={1}
                        onFinishRating={(rating) => this.setState({ rating: rating })}
                        number={0}
                    />
                    <Input
                        value={this.state.author}
                        placeholder="Author"
                        leftIcon={{ type: 'font-awesome', name: 'user' }}
                        leftIconContainerStyle={{marginRight:10}}
                        onChangeText={(text) => { this.setState({ author: text }) }}
                        autoCapitalize="words"
                    />
                    <Input
                        value={this.state.comment}
                        placeholder="Comment"
                        multiline
                        leftIcon={{ type: 'font-awesome', name: 'comment' }}
                        leftIconContainerStyle={{marginRight:10}}
                        onChangeText={(text) => { this.setState({ comment: text }) }}
                    />
                    <View style={{ margin: 10 }}>
                        <Button
                            onPress={() => { this.submitComment() }}
                            color="#512DA8"
                            title="Submit"
                        />
                    </View>
                    <View style={{ margin: 10 }}>
                        <Button
                            onPress={() => { this.toggleModal() }}
                            title="Cancel"
                        />
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

function RenderComments(props) {

    const comments = props.comments;

    const renderCommentItem = ({ item, index }) => {
        return (
            <View key={index} style={{ margin: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.comment}</Text>
                <Rating
                    readonly
                    imageSize={20}
                    style={{ paddingVertical: 10, flexDirection: 'row' }}
                    startingValue={item.rating}
                />
                <Text style={{ fontSize: 12, flexDirection: 'row', textAlign: 'right' }}>{'-- ' + item.author + ', ' + (new Date(item.date)).toLocaleDateString()}</Text>
            </View>
        );
    };

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title='Comments' >
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

function RenderDish(props) {
    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if (dx < -200)
            return true;
        else
            return false;
    }

    const recognizeComment = ({ moveX, moveY, dx, dy }) => {
        if (dx > 200)
            return true;
        else
            return false;
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => { this.view.rubberBand(1000) },
        onPanResponderEnd: (e, gestureState) => {
            if (recognizeDrag(gestureState)) {
                if (props.favorite)
                    Alert.alert(
                        'Remove Favorite',
                        'Are you sure you wish to remove ' + dish.name + ' from favorites?',
                        [
                            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                            { text: 'OK', onPress: () => { props.remove() } },
                        ],
                        { cancelable: false }
                    )
                else
                    Alert.alert(
                        'Add Favorite',
                        'Are you sure you wish to add ' + dish.name + ' to favorites?',
                        [
                            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                            { text: 'OK', onPress: () => { props.onPress() } },
                        ],
                        { cancelable: false }
                    )
            }
            if (recognizeComment(gestureState)) {
                props.toggleModal();
            }
            return true;
        }
    });

    const shareDish = (title, message, url) => {
        Share.share({
            title: title,
            message: 'Check out ' + title + '! ' + message + ' ' + url,
            url: url
        },{
            dialogTitle: 'Share ' + title
        })
    }

    if (dish != null) {
        const deleteAlert = () => {
            Alert.alert(
                'Remove favorite?',
                `Are you sure you wish to remove ${dish.name} from favorites?`,
                [
                    {
                        text: 'Cancel',
                        onPress: () => console.log(dish.name + 'Not Deleted'),
                        style: ' cancel'
                    },
                    {
                        text: 'OK',
                        onPress: () => props.remove()
                    }
                ],
                { cancelable: false }
            );
        }

        return (
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000} ref={this.handleViewRef} {...panResponder.panHandlers}>
                <Card
                    featuredTitle={dish.name}
                    image={{ uri: baseUrl + dish.image }}>
                    <Text style={{ margin: 10 }}>
                        {dish.description}
                    </Text>
                    <View style={styles.Row}>
                        <Icon
                            raised
                            reverse
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? deleteAlert() : props.onPress()}
                        />
                        <Icon
                            reverse
                            name='pencil'
                            type='font-awesome'
                            color='#512DA8'
                            onPress={() => props.toggleModal()}
                        />
                        <Icon
                            raised
                            reverse
                            name='share-alt'
                            type='font-awesome'
                            color='#51D2A8'
                            style={styles.cardItem}
                            onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} />
                    </View>
                </Card>
            </Animatable.View>);
    }
    else {
        return (<View></View>);
    }
}
const styles = StyleSheet.create({
    Row: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);