 import Product from './Product.jsx';


 function ProductTab(){
   let styles={
      display:"flex",
      flexWrap:"wrap",
      justifyContent:"center",
      alignItems:"center",
   }
    return ( 
       <div style={styles} className="Product-Tab">
       <Product title="Logintech mx mastar"  idx={0} />
       <Product title="apple pencil (2nd gen) " idx={1}/>
       <Product title="zebronics zeb-transformer" idx={2} />
       <Product  title="petronics toad 23" idx={3} /> 
       </div>
    );
   }
 export default ProductTab;