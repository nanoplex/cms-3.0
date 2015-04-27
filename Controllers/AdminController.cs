using System.Web.Mvc;
using cms.Models;
using System.Threading.Tasks;
using Newtonsoft.Json;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Linq;
using System.Collections.Generic;
using System;

namespace cms.Controllers
{
    public class AdminController : Controller
    {
        static Site _Site = new Site();

        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public async Task<string> Site()
        {
            try
            {
                await _Site.GetSite();

                return JsonConvert.SerializeObject(_Site);
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
        [HttpGet]
        public async Task<string> Auth()
        {
            try
            {
                await _Site.GetSite();

                if (_Site.ProjectName == null)
                    return "new";
                else
                    return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
        [HttpPost]
        public async Task<string> ToggleStatistics()
        {
            try
            {
                await DatabaseContext.Site.UpdateOneAsync(
                    s => s.Id == _Site.Id,
                    Builders<Site>.Update
                        .Set(s => s.StatisticsOn, !_Site.StatisticsOn));

                return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
        [HttpPost]
        public async Task<string> InitProject(string name)
        {
            try
            {
                _Site.ProjectName = name;
                _Site.StatisticsOn = false;

                await DatabaseContext.Site.InsertOneAsync(_Site);

                return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }

        }
        [HttpPost]
        public async Task<string> AddPage(string name, int? order)
        {
            try
            {
                var page = await DatabaseContext.Pages.Find(
                    Builders<Page>.Filter.Eq(p => p.Name, name))
                    .SingleOrDefaultAsync();

                var id = ObjectId.GenerateNewId(DateTime.Now);

                if (page == null)
                {
                    await DatabaseContext.Pages.InsertOneAsync(new Page
                    {
                        Id = id,
                        Name = name,
                        Visible = true,
                        Order = (int)order
                    });

                    return "true";
                }
                else
                {
                    return "false";
                }
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
        [HttpPost]
        public async Task<string> DeletePage(string id)
        {
            try
            {
                var Id = ObjectId.Parse(id);

                await DatabaseContext.Pages.DeleteOneAsync(
                    p => p.Id == Id);

                return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
        [HttpPost]
        public async Task<string> TogglePageVisibility(string id)
        {
            try
            {
                var page = _Site.Pages.Where(p => p.Id == ObjectId.Parse(id)).FirstOrDefault();

                page.Visible = !page.Visible;

                await page.Edit();

                return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
        [HttpPost]
        public async Task<string> AddComponent(string name, string properties, string pageName)
        {
            try
            {
                var component = _Site.Components.Where(c => c.Name == name).FirstOrDefault();
                var page = _Site.Pages.Where(p => p.Name == pageName).FirstOrDefault();
                var props = JsonConvert.DeserializeObject<List<Property>>(properties);

                await DatabaseContext.Components.InsertOneAsync(new Component
                {
                    Name = name,
                    Properties = props,
                    Frontend = component.Frontend,
                    PageFk = page.Id
                });

                return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
        [HttpPost]
        public async Task<string> EditComponent(string id, string properties)
        {
            try
            {
                var component = new Component();

                foreach (var page in _Site.Pages)
                {
                    component = page.Components.Where(c => c.Id == ObjectId.Parse(id)).FirstOrDefault();
                    if (component != null)
                        break;
                }

                component.Properties = JsonConvert.DeserializeObject<List<Property>>(properties);

                await DatabaseContext.Components.UpdateOneAsync(
                    c => c.Id == component.Id,
                    Builders<Component>.Update
                        .Set(c => c.Properties, component.Properties));

                return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
        [HttpPost]
        public async Task<string> DeleteComponent(string id)
        {
            try
            {
                var Id = ObjectId.Parse(id);

                await DatabaseContext.Components.DeleteOneAsync<Component>(
                    c => c.Id == Id);

                return "true";
            }
            catch (MongoException ex)
            {
                return ex.Message;
            }
        }
    }
}