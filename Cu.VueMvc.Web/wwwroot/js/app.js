let app = new Vue({
    el: "#app",
    data: {
        pageTitle: "Vue in Mvc",
        categoriesVisible: false,
        productsVisible: false,
        baseUrl: "https://localhost:44326/api",
        categories: [],
        properties: [],
        loading: false,
        products: [],
        hasError: false,
        errorMessage: "",
        productDto: {
            name: "",
            categoryId: 0,
            price: 0,
            propertyIds: [],
            image: null,
        },
    },
    methods: {
        showCategories: async function () {
            this.hasError = false;
            this.productsVisible = false;
            this.loading = true;
            //get the categories from the api
            this.categories = await axios.get(`${this.baseUrl}/categories`)
                .then(response => response.data.items)
                .catch(error => {
                    if (error.response.status == 404) {
                        this.errorMessage = "endpoint not found!";
                    }
                    this.hasError = true;
                });
            this.categoriesVisible = true;
            this.loading = false;
        },
        showProducts: async function (categoryId) {
            let url = `${this.baseUrl}/products`;
            if (categoryId !== undefined) {
                url += `/category/${categoryId}`;
            }
            
            this.hasError = false;
            this.categoriesVisible = false;
            this.loading = true;
            //get the products from the api
            this.products = await axios.get(url)
                .then(response => response.data)
                .catch(error => {
                    if (error.response.status == 404) {
                        this.errorMessage = "endpoint not found!";
                    }
                    this.hasError = true;
                })
                .finally(() => {
                    this.productsVisible = true;
                    this.loading = false;
                });
        },
        showAddProductModal: async function () {
            //get the categories
            this.loading = true;
            this.categories = await axios.get(`${this.baseUrl}/categories`)
                .then(response => response.data.items)
                .catch(error => {
                    this.hasError = true;
                    this.errorMessage = error.message;
                })
                .finally(() => { this.loading = false; })
            this.properties = [
                {id:1,name:'Basic'},
                {id:2,name:'Luxury'},
                {id:3,name:'Family'},
                {id:4,name:'Budget'},
            ];
            $('#addProductModal').modal('show');
        },
        hideAddProductModal: function () {
            $('#addProductModal').modal('hide');
        },
        getFile: function (e) {
            this.productDto.image = e.target.files[0];
        },
        addProduct: async  function () {
            //validate(at the end)
            //create formdata
            this.loading = true;
            let formData = new FormData();
            formData.append("name", this.productDto.name);
            formData.append("price", this.productDto.price);
            formData.append("categoryId", this.productDto.categoryId);
            formData.append("image", this.productDto.image);
            //properties
            this.productDto.propertyIds.forEach(pr => {
                formData.append("properties[]", pr);
            });
            //create headers => enctype, bearer token
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcHJpbWFyeXNpZCI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9kYXRlb2ZiaXJ0aCI6IjI1LzEyLzE5NzIgMDowMDowMCIsImV4cCI6MTcwMjA0NjYzMCwiaXNzIjoiUHJvZHVjdHMuY29tIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NTAwMSJ9.iWJpc28xKCL5jzzBhdQo4da-Seas3dLa_SeCchuFqQU';
            const headers = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            }
            //api post request
            const url = `${this.baseUrl}/products`;
            await axios.post(url, formData, headers)
                .then(response => {
                    this.showProducts();
                    this.hideAddProductModal();
                    this.resetProductForm();
                })
                .catch(error => {
                    this.hasError = true;
                    this.errorMessage = error.message;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        deleteProduct: async function (id) {
            this.loading = true;
            const url = `${this.baseUrl}/products/${id}`;
            await axios.delete(url)
                .then(response => {
                    this.showProducts();
                })
                .catch(error => {
                    this.hasError = true;
                    this.errorMessage = error.message;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        resetProductForm: function () {
            this.productDto.name = "";
            this.productDto.price = "";
            this.productDto.categoryId = 0;
            this.productDto.propertyIds = [];
            this.productDto.image = null;
            $('#productImage')[0].value="";
        }
    },
});