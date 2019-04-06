import React, { Component } from 'react';
import { connect } from 'react-redux'
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import WithErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import * as actions from '../../store/actions/index';
import axios from '../../axios-orders';




export class BurgerBuilder extends Component {

    state = {
        purchasing: false,
    }

    componentDidMount () {
        this.props.onInitIngredients();
    }

    updatePurchaseState = (ingredients) => {
        const sum = Object.keys(ingredients).map(igKey => {
                return ingredients[igKey];
            })
            .reduce((sum, el) => {
                return sum + el;
            }, 0);
         return sum > 0;
    }

    purchaseHandler = () => {
        if(this.props.isAuthenticated){
            this.setState({purchasing: true});
        } else {
            this.props.onSetAuthRedirectPath('/checkout');
            this.props.history.push('/auth');
        }
        
    }

    purchaseContinueHandler = () => {
        this.props.onInitPurchase();
        this.props.history.push('/checkout');
    }

    purcahseCancelHandler = () => {
        this.setState({purchasing: false})
    }



    render(){
        const disabledinfo = {
            ...this.props.ings
        };
        for(let key in disabledinfo) {
            disabledinfo[key] = disabledinfo[key] <= 0
        }
        let orderSummary = null;
        
        
        let burger = this.props.error ? <p>Ingredients can't be loaded...</p> : <Spinner />;

        if (this.props.ings){
            burger = (
                <>
                    <Burger ingredients={this.props.ings}/>
                    <BuildControls 
                        ingredientAdded= {this.props.onIngredientAdded}
                        ingredientRemoved= {this.props.onIngredientRemoved}
                        disabled={disabledinfo}
                        price={this.props.price}
                        ordered={this.purchaseHandler}
                        isAuth={this.props.isAuthenticated}
                        purchasable={this.updatePurchaseState(this.props.ings)}/>
                </>
             );
             orderSummary = <OrderSummary
            price={this.props.price}
            purchaseCancelled={this.purcahseCancelHandler}
            purchaseContinued={this.purchaseContinueHandler} 
            ingredients={this.props.ings} />
        }
        
        return (
           <>
            <Modal show={this.state.purchasing} modalClosed={this.purcahseCancelHandler}>
                {orderSummary}
            </Modal>
            {burger}
           </>
        );
    }
}

const mapStateToProps = state  => {
    return {
        ings: state.burgerBuilder.ingredients,
        price: state.burgerBuilder.totalPrice,
        error: state.burgerBuilder.error,
        isAuthenticated: state.auth.token !== null
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onIngredientAdded: (ingName) => dispatch(actions.addIngredient(ingName)),
        onIngredientRemoved: (ingName) => dispatch(actions.removeIngredient(ingName)),
        onInitIngredients: () => dispatch(actions.initIngredients()),
        onInitPurchase: () => dispatch(actions.purchaseInit()),
        onSetAuthRedirectPath: (path) => dispatch(actions.setAuthRedirectPath(path))
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(WithErrorHandler(BurgerBuilder, axios));