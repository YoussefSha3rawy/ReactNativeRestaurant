import React, { Component } from 'react';
import { Text, View, Animated, Easing, Button } from 'react-native';
import { Card } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { Loading } from './LoadingComponent';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        promotions: state.promotions,
        leaders: state.leaders
    }
}

function RenderItem(props) {

    const item = props.item;
    const navigate = props.navigate;

    function onCardPress(type) {
        switch (type) {
            case 'dish': navigate('Dishdetail', { dishId: item.id }); return;
            case 'promo': navigate('Menu', {}); return;
            default: navigate('About', {});
        }
    }

    if (props.isLoading) {
        return (
            <Loading />
        );
    }
    else if (props.erreMess) {
        return (
            <Text>{props.erreMess}</Text>
        );
    }
    else {
        if (item != null) {
            return (
                <TouchableOpacity
                    onPress={() => onCardPress(props.type)}>
                    <Card
                        featuredTitle={item.name}
                        featuredSubtitle={item.designation}
                        image={{ uri: baseUrl + item.image }}>
                        <Text
                            style={{ margin: 10 }}>
                            {item.description}</Text>
                    </Card>
                </TouchableOpacity>
            );
        }
        else {
            return (<View></View>);
        }
    }
}

class Home extends Component {

    constructor(props) {
        super(props);
        this.animatedValue = new Animated.Value(0);
    }

    static navigationOptions = {
        title: 'Home',
    };

    componentDidMount() {
        this.animate()
    }

    animate() {
        this.animatedValue.setValue(0)
        Animated.timing(
            this.animatedValue,
            {
                toValue: 8,
                duration: 16000,
                easing: Easing.linear
            }
        ).start(() => this.animate())
    }

    render() {
        const { navigate } = this.props.navigation;

        const xpos1 = this.animatedValue.interpolate({
            inputRange: [0, 1, 3, 5, 8],
            outputRange: [1200, 600, 0, -600, -1200]
        })
        const xpos2 = this.animatedValue.interpolate({
            inputRange: [0, 2, 4, 6, 8],
            outputRange: [1200, 600, 0, -600, -1200]
        })
        const xpos3 = this.animatedValue.interpolate({
            inputRange: [0, 3, 5, 7],
            outputRange: [1200, 600, 0, -600]
        })

        return (
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                <Animated.View style={{ width: '100%', transform: [{ translateX: xpos1 }] }}>
                    <RenderItem item={this.props.dishes.dishes.filter((dish) => dish.featured)[0]}
                        isLoading={this.props.dishes.isLoading}
                        erreMess={this.props.dishes.erreMess}
                        navigate={navigate} type='dish'
                    />
                </Animated.View>
                <Animated.View style={{ width: '100%', transform: [{ translateX: xpos2 }] }}>
                    <RenderItem item={this.props.promotions.promotions.filter((promo) => promo.featured)[0]}
                        isLoading={this.props.promotions.isLoading}
                        erreMess={this.props.promotions.erreMess}
                        navigate={navigate} type='promo'
                    />
                </Animated.View>
                <Animated.View style={{ width: '100%', transform: [{ translateX: xpos3 }] }}>
                    <RenderItem item={this.props.leaders.leaders.filter((leader) => leader.featured)[0]}
                        isLoading={this.props.leaders.isLoading}
                        erreMess={this.props.leaders.erreMess}
                        navigate={navigate} type='leader'
                    />
                </Animated.View>
            </View>
        );
    }
}

export default connect(mapStateToProps)(Home);