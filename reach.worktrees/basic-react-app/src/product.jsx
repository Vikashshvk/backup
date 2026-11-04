
import './Product.css';
import Price from './price.jsx';
function Product({title,idx}) { 
    let oldPrices = ["12,495", "11,900", "1,599", "599"];
    let newPrices = ["8,999", "9,199", "899", "278"];
    let Description = [ "8,000 DPI", "intuitive surface", "designed for iPad Pro", "wireless"];
    
     return (
    <div className="Product"> 
     <h1>{title}</h1>
     <p>{Description[idx]}</p>
     <Price  oldPrices={oldPrices[idx]} newPrices={newPrices[idx]}/>
     
        
    </div>  
    ); 
}
    
    
    export default Product;

    