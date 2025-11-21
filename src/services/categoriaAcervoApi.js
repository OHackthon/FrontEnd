import API from '@/services/axiosInterceptor.js'

export default class CategoriaAcervoApi {
    async fetchCategorias() {
        const { response } =  await API.get('categorias-acervo/')
        return response.data
    }
    async createCategoria(categoria) {
        const { response } = await API.post('categorias-acervo/', categoria)
        return response.data
    }
    async updateCategoria(categoria) {
        const { response } = await API.put(`categorias-acervo/${acervo.id}/`, categoria)
        return response.data
    }
    async deleteCategoria(id) {
        await API.delete(`categorias-acervo/${id}/`)
    }
}